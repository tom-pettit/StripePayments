<template>
  <div id="app">
    <img height=150 width=150 src="images\chocolateBoba.png">
    <h2>Boba Shop</h2>

    <h2>Menu: </h2>

    <div id='store-items'>

      <div class='tea' v-for="tea in teas[0]">
        <img v-bind:src="tea.imgName"/>
        <br>
        <h3>{{tea.name}}</h3>
        <p>price: {{tea.price / 100}}</p>
        <button v-on:click="addToCart(tea.id, tea.name, tea.price, tea.imgName)">Add</button>
      </div>

    </div>

    <div id='cart'>
      <div class='cart-info'>

        <div>
          <p class='cart-info-name'>Total: </p>
          <p class='cart-info-price'>${{this.total / 100}}</p>
        </div>
        <div>
          <button v-on:click='purchase()'>Purchase</button>
        </div>
      </div>
      <div id='cart-summary'>
        <div class='order-item' v-for="item in order" v-bind:id="item.id">
          <img height=50 width=50 v-bind:src="item.imgName"/>
          <p class='order-item-name'>{{item.name}}</p>
          <p class='order-item-price'>{{item.price / 100}}</p>
        </div>
      </div>
    </div>
  </div>

</template>

<script>

import axios from 'axios'

var stripeHandler = StripeCheckout.configure({
  key: stripePublicKey,
  locale: 'auto',
  token: function(token) {
    var items = []
    var order = document.getElementsByClassName('order-item')
    var i;
    for (i = 0; i < order.length; i ++) {
      items.push(order[i].id)
    }
    axios
    .post('http://localhost:8090/purchase', 
      {
        items: items,
        stripeTokenId: token.id
      },
      { 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    ).then(function(data) {
      alert(data.data.message)
      //GET RID OF CAAART ITEMS HEREE
    }).catch(function(err) {
      console.error(err)
    })

    var cartItems = document.getElementById('cart-summary')
    while (cartItems.hasChildNodes()) {
      cartItems.removeChild(cartItems.firstChild)
    }
  }
})


export default {
  name: 'app',
  data () {
    return {
      teas: [

      ],
      order: [

      ],
      total: 0
    }
  },
  methods: {
    addToCart: function(id, name, price, img) {
      this.order.push({
        id: id,
        name: name,
        price: price,
        imgName: img
      })
      this.total += price
    },

    purchase: function() {
      var price;
      var i;
      var ids = []
      for (i = 0; i < this.order.length; i++) {
        ids.push(this.order[i].id)
    }

      axios
      .get('http://localhost:8090/get_price/'+ids)
      .then(response => {
        console.log('RESPONSE', response.data)
        price = response.data
        stripeHandler.open({
          amount: price

        })
      })
      .catch(err => {
        alert(err)
      })

      this.total = 0


    
    }
  },
  beforeCreate() {
      axios
      .get('http://localhost:8090/store')
      .then(response => {
        this.teas.push(response.data.teas)
      })
      .catch(err => {
        alert(err)
      })
    }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.tea {
  margin: 20px;
  text-align: center;
  display: inline-block;
  border: 1px solid black;
  width: 250px
}

.tea img {
  text-align: center;
  display: inline-block;
  height: 150px;
  width: 150px;
  margin: 15px
}

.tea h3 {
  display: inline-block
}

.tea p {
  padding-left: 10px;
  display: inline-block
}

#cart {
  display: inline-block;
  width: 500px;
  border: 1px solid black
}

.cart-info {
  margin: 20px;
}

.cart-info div {
  display: inline;
}

.cart-info .cart-info-cart {
  float:left
}

.cart-info .cart-info-name {
  text-align: center;
}

.cart-info .cart-info-total {
  float:right;
}

.cart-info p{
  display: inline-block;
}

.order-item {
  margin: 20px;
}

.order-item img {
  border-radius: 50%;
  float:left
}

.order-item .order-item-name {
  text-align: center;
}

.order-item .order-item-price {
  float:right;
}

.order-item p{
  display: inline-block;
}

</style>
