
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

app.post('/purchase', function(req, res) {
    fs.readFile('items.json', function(error, data) {
        if (error) {
            res.status(500).end()
        } else {
            const itemsJSON = JSON.parse(data)
            const itemsArray = itemsJSON.teas
            var total = 0
            req.body.items.forEach(function(item) {
                console.log(item)
                const itemJSON = itemsArray.find(function(i) {
                    return i.id == item
                })
                total = total + itemJSON.price
            })
            stripe.charges.create({
                amount: total,
                source: req.body.stripeTokenId,
                currency: 'usd'
            }).then(function() {
                console.log('charge successful')
                res.json({
                    message: 'successfully purchased items'
                })
            }).catch(function() {
                console.log('charge fail')
                res.status(500).end()
            })
        }
    })
})

app.listen(8090)