<template>
  <div class="shopping_cart">
    <!-- 菜单 -->
    <ul class="left_menu">
      <li v-for="(item, index) in list" :key="index" :class="nowIndex === index ? 'sel' : ''" @click="changeMenu(index)">{{item.menu}}</li>
    </ul>
    <ul class="right_menu" ref="foodList" @scroll="scrollMenu($event)">
      <li v-for="(item, index) in list" :key="index" class="foodItem">
        <h3>{{item.menu}}</h3>
        <ol>
          <li v-for="its in item.data" :key="its.id">
            <img>
            <div class="content">
              <h4>{{its.title}}</h4>
              <p class="other">{{its.raw}}</p>
              <p class="other">月售：{{its.sale_num}}</p>
              <div class="price">
                <h5>价格：￥{{its.price}}</h5>
                <!-- 计数器 -->
                <div class="num">
                  <p v-if="hasNum(its.id)" class="sub" @click="sub(its.id)">-</p>
                  <span v-if="hasNum(its.id)">{{hasNum(its.id)}}</span>
                  <p class="add" @click="add(index, its.id)">+</p>
                </div>
              </div>
            </div>
          </li>
        </ol>
      </li>
    </ul>
    <!-- 购物车 -->
    <div class="bug_goods">
      <div class="end_price" @click="toggle">
        <div class="left">
          <p>￥{{endPrice}}</p>
          <p class="distribution">另需配送费 ￥{{distribution}} <span>￥5</span></p>
        </div>
        <div :class="buttonClass" @click.stop="submit">{{buttonShow}}</div>
      </div>
    </div>
    <!-- 货物列表购物车 -->
    <div :style="{bottom: goodsListShow ? '45px' : '-300px'}" class="goods_list">
      <div class="top">
        <h3>已选商品</h3>
        <p @click="clearShoppingcar">清空</p>
      </div>
      <ul>
        <li v-for="item in shoppingList" :key="item.id">
          <img>
          <div class="content">
            <h4>{{item.title}}</h4>
            <div class="price">
              <h5>价格：￥{{item.price}}</h5>
              <!-- 计数器 -->
              <div class="num">
                <p v-if="hasNum(item.id)" class="sub" @click="sub(item.id)">-</p>
                <span v-if="hasNum(item.id)">{{hasNum(item.id)}}</span>
                <p class="add" @click="add(item.index, item.id)">+</p>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <!-- 蒙版 -->
    <div v-if="goodsListShow" class="bg_mb" @click="goodsListShow = false"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, ref, onMounted } from 'vue';
import { data, IPropData } from "@/data/index"

interface IPropCommon {
  nowIndex: number;
  list: Array<IPropData>;
  listHeight: Array<number>;
  endPrice: number;
  distribution: number;
}

interface IPropShoppingList {
  id: number;
  title: string;
  raw: string;
  sale_num: string;
  price: number;
  index: number;
  num: number;
}

export default defineComponent({
  name: 'shopping_cart',
  setup() {
    // 公共信息
    const common: IPropCommon = reactive({
      nowIndex: 0,
      list: [],
      listHeight: [],
      // 购物价格
      endPrice: 0,
      // 配送费
      distribution: 3,
    })

    // 初始化
    onMounted(() => {
      common.list = data
      init()
    })
    // 初始化计算
    let foodList = ref<HTMLElement | null>(null)
    const init = async () => {
      const itemList = await (foodList.value as HTMLElement).getElementsByClassName('foodItem')
      let height = 0
      common.listHeight.push(0)
      for(let i = 0; i < itemList.length; i++) {
        height += itemList[i].scrollHeight
        common.listHeight.push(height)
      }
    }
     // 起送价格
    const startPrice = ref<number>(20)
    // 实际价格
    const actualPrice = ref<number>(0)
    // 计算属性
    const buttonShow = computed(() => {
      return actualPrice.value < startPrice.value ? `还差￥${startPrice.value - actualPrice.value}起送` : `结算`
    })
    const buttonClass = computed(() => {
      return actualPrice.value < startPrice.value ? `right cannotSale` : `right canSale`
    })
    // 切换左侧菜单
    const changeMenu = (index: number) => {
      common.nowIndex = index
      if (foodList.value) {
        foodList.value.scrollTop = common.listHeight[index]
      }
    }
    // 右侧滚动
    const scrollMenu = (e: MouseEvent) => {
      const scrollTop = (e.target as HTMLElement).scrollTop
      for(let i = 0; i < common.listHeight.length; i++) {
        if(scrollTop >= common.listHeight[i] && scrollTop < common.listHeight[i + 1]) 
        common.nowIndex = i
      }
    }

    let shoppingList = ref<Array<IPropShoppingList>>([])
    const goodsListShow = ref<boolean>(false)
    // 添加购物车
    const add = (index: number, id: number) => {
      const hasNum = shoppingList.value.find(item => item.id === id)
      if(hasNum) {
        // 购物车数量已有>1
        const list: Array<IPropShoppingList> = shoppingList.value.map(item => {
          if(item.id === id) item.num++
          item.index = index
          return item
        })
        shoppingList.value = list
      } else {
        const nowItem = common.list[index].data.filter(item => item.id === id)[0]
        shoppingList.value.push(Object.assign(nowItem, {num: 1, index}))
      }
      countPrice(shoppingList.value)
    }
    // 删除购物车
    const sub = (id: number) => {
      const list = shoppingList.value.map(item => {
        if(item.id === id) item.num--
        return item
      }).filter(its => its.num)
      shoppingList.value = list
      countPrice(shoppingList.value)
      // 当购物车无货物，隐藏
      if(!list.length) {
        goodsListShow.value = false
      }
    }

    // 匹配货物是否数量为空
    const hasNum = (id: number): boolean | number => {
      const list = shoppingList.value.filter(item => item.id === id)
      return list.length > 0 ? list[0].num : false
    }
    // 计算价格
    const countPrice = (list: Array<IPropShoppingList>) => {
      let endPrice = 0
      if(list.length) {
        list.forEach(item => {
          endPrice += item.num * item.price
        })
      }
      common.endPrice = endPrice
      actualPrice.value = endPrice + (list.length ? common.distribution : 0)
    }

    // 切换展示购物车里的东西
    const toggle = () => {
      if (shoppingList.value.length)
      goodsListShow.value = !goodsListShow.value
    }
    // 清空购物车
    const clearShoppingcar = ():void => {
      shoppingList.value = []
      countPrice([])
      goodsListShow.value = false
    }
    // 提交
    const submit = ():void => {
      if(actualPrice.value > startPrice.value) {
        alert('提交成功')
        shoppingList.value = []
        countPrice([])
        goodsListShow.value = false
      }
    }
    return {
      ...toRefs(common),
      init,
      foodList,
      startPrice,
      actualPrice,
      buttonShow,
      buttonClass,
      changeMenu,
      scrollMenu,
      goodsListShow,
      shoppingList,
      add,
      sub,
      hasNum,
      countPrice,
      toggle,
      clearShoppingcar,
      submit
    }
  }
});
</script>

<style lang="scss" scoped>
.shopping_cart {
  display: flex;
  align-items: flex-start;
}
.left_menu {
  width: 25%;
  min-height: 100vh;
  background: #f1f1f1;
  border-right: 1px solid #e9e9e9;
  li {
    width: 100%;
    height: 40px;
    line-height: 40px;
  }
  .sel {
    background: #fff;
  }
}
.right_menu {
  margin-left: 20px;
  text-align: left;
  font-size: 12px;
  width: 73%;
  height: calc(100vh - 50px);
  // height: 100vh;
  overflow-y: auto;
  transition: all 0.3s ease-in;
  li {
    h3 {
      height: 30px;
      line-height: 30px;
    }
    ol {
      width: 100%;
      li {
        display: flex;
        align-items: flex-start;
        margin-top: 10px;
        img {
          width: 100px;
          height: 100px;
          border-radius: 5px;
          background: #ccc;
        }
        .content {
          margin-left: 20px;
          h4 {
            font-size: 16px;
          }
          .other {
            font-size: 12px;
            color: #3e3e3e;
            margin-top: 8px;
          }
          .price {
            width: 155px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            h5 {
              font-size: 14px;
              color: #ff600b;
              font-weight: 500;
            }
            .num {
              display: flex;
              align-items: center;
              margin-right: 5px;
            }
            p {
              width: 18px;
              height: 18px;
              text-align: center;
              line-height: 18px;
              font-size: 18px;
              border-radius: 50%;
              border: 1px solid #4e9aff;
            }
            .sub {
              color: #4e9aff;
            }
            span {
              font-size: 16px;
              color: #111;
              margin: 0 6px;
            }
            .add {
              color: #fff;
              background: #4e9aff;
            }
          }
        }
      }
    }
  }
}
.bug_goods {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  border-top: 1px solid #e9e9e9;
  z-index: 99;
  .end_price {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0;
    .left {
      margin-left: 20px;
      p {
        font-size: 16px;
        color: #111;
        text-align: left;
      }
      .distribution {
        font-size: 12px;
        color: #3e3e3e;
        margin-top: 2px;
        span {
          text-decoration: line-through
        }
      }
    }
    .right {
      margin-right: 20px;
      padding: 8px 15px;
      font-size: 15px;
      color: #fff;
      border-radius: 20px;
    }
    .cannotSale {
      background: #99979A;
    }
    .canSale {
      background: #47B4FE;
    }
  }
}
.goods_list {
  position: fixed;
  width: 100%;
  padding: 0 20px 10px;
  box-sizing: border-box;
  border: 1px solid #e6e6e6;
  z-index: 98;
  background: #fff;
  transition: all 0.3s ease;
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    h3 {
      font-size: 14px;
    }
    p {
      color: rgb(128, 123, 123);
      font-size: 12px;
    }
  }
  ul {
    width: 100%;
    max-height: 300px;
    overflow-y: scroll;
    li {
      display: flex;
      align-items: flex-start;
      margin-top: 10px;
      img {
        width: 80px;
        height: 80px;
        border-radius: 5px;
        background: #ccc;
      }
      .content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: calc(100% - 100px);
        height: 75px;
        margin-left: 20px;
        h4 {
          font-size: 16px;
          text-align: left;
        }
        .price {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          h5 {
            font-size: 14px;
            color: #ff600b;
            font-weight: 500;
          }
          .num {
            display: flex;
            align-items: center;
            margin-right: 5px;
          }
          p {
            width: 18px;
            height: 18px;
            text-align: center;
            line-height: 18px;
            font-size: 18px;
            border-radius: 50%;
            border: 1px solid #4e9aff;
          }
          .sub {
            color: #4e9aff;
          }
          span {
            font-size: 16px;
            color: #111;
            margin: 0 6px;
          }
          .add {
            color: #fff;
            background: #4e9aff;
          }
        }
      }
    }
  }
}
.bg_mb {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.2);
  z-index: 96;
}
</style>

