
require('dotenv').config()
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const express = require('express')
const app = express()
const fs = require('fs')
const stripe = require('stripe')(stripeSecretKey)
var cors = require('cors')
const { request } = require('http')
app.use(cors())
app.use(express.json())


var order = []

app.get('/store', function(req, res) {
    fs.readFile('items.json', function(error, data) {
        if (error) {
            res.status(500).end()
        } else {
            res.json(JSON.parse(data))
        }
    })
})

app.get('/get_price/:ids', function(req, res) {
    const ids = req.params.ids.split(',')
    order = ids
    var i
    for (i = 0; i < ids.length; i++) {
        ids[i] = parseInt(ids[i])
    }

    
    
    fs.readFile('items.json', function(error, data) {
        var total = 0
        if (error) {
            res.status(500).end()
        } else {
            const info = JSON.parse(data)

            var j;
            for (j = 0; j < ids.length; j++) {
                var id = ids[j]
                for (i = 0; i < info.teas.length; i++) {
                    if (info.teas[i].id == id) {
                        total += info.teas[i].price
                        
                    }
                }
            }
        }

        if (total == 0) {
            res.status(500).end()
        } else {
            res.json(total)
        }
    })
})


app.get('/order_info/:items', function(req, res) {
    var input = JSON.parse("[" + req.params.items + "]")
    fs.readFile('items.json', function(error, data) {
        if (error) {
            res.status(500).end()
        } else {
            const itemsJSON = JSON.parse(data)
            const itemsArray = itemsJSON.teas
            var total = 0
            var your_order = ''
            input.forEach(function(item) {
                const itemJSON = itemsArray.find(function(i) {
                    return i.id == item
                })
                total = total + itemJSON.price
                your_order += itemJSON.name + ', '
            })

            your_order = your_order.slice(0, -2)
            total = total 

            res.json({your_order: your_order, total: total})
        }
    })})


app.post('/order_id', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
            currency: 'usd',
            product_data: {
                name: req.body.your_order
            },
            unit_amount: req.body.total,
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: 'http://localhost:8080',
        cancel_url: 'http://localhost:8080',
    })

    console.log('ORDER ID RESPONSE', req.body.your_order, req.body.total)


    res.json({session_id: session.id})

        
    })

app.listen(8090)