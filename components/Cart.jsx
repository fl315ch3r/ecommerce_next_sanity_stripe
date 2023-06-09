import React, { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AiOutlineMinus, AiOutlinePlus, AiOutlineLeft, AiOutlineShopping } from 'react-icons/ai'
import { TiDeleteOutline } from 'react-icons/ti'
import Image from 'next/image'
import mp_logo from '../public/assets/mercado_pago_transp_logo.png'

import toast from 'react-hot-toast'

import { useStateContext } from '../context/StateContext'
import { urlFor } from '../lib/client'
import getStripe from '../lib/getStripe'

// import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'




const Cart = () => {

  const cartRef = useRef()
  const router = useRouter()

  const { totalPrice, totalQuantities, cartItems, setShowCart, toggleCartItemQuantity, onRemove } = useStateContext()

  /* initMercadoPago(process.env.NEXT_PUBLIC_KEY) */

  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)



  const handleStripeCheckout = async () => {
    const stripe = await getStripe()

    const response = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartItems)
    })

    if (response.satusCode === 500) return

    const data = await response.json()

    toast.loading('Redirecting...')

    stripe.redirectToCheckout({ sessionId: data.id })
  }

  useEffect(() => {
    const handleMPCheckout = async () => {
      setLoading(true)

      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cartItems)
        })

        if (response.satusCode === 500) return

        const data = await response.json()
        console.log('RESPONSE: ', JSON.stringify(data))

        setUrl(data.url);

      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    }
    if (cartItems.length > 0) {
      handleMPCheckout()
    }


  }, [cartItems])





  return (
    <div className='cart-wrapper'>
      <div className='cart-container'>
        <button
          type='button'
          className='cart-heading'
          onClick={() => setShowCart(false)}>
          <AiOutlineLeft />
          <span className='heading'>Your Cart</span>
          <span className='cart-num-items'>({totalQuantities} items)</span>
        </button>

        {
          cartItems.length < 1 && (
            <div className='empty-cart'>
              <AiOutlineShopping size={150} />
              <h3>Your shopping bag is empty</h3>
              <Link href='/'>
                <button
                  type='button'
                  onClick={() => setShowCart(false)}
                  className='btn'
                >Continue Shopping</button>
              </Link>
            </div>
          )
        }

        <div className='product-container'>
          {cartItems.length >= 1 && cartItems.map((item, index) => (
            <div className='product' key={item._id}>
              <img src={urlFor(item?.image[0])} alt="" className='cart-product-image' />
              <div className='item-desc'>
                <div className='flex top'>
                  <h5>{item.name}</h5>
                  <h4>${item.price}</h4>
                </div>
                <div className='flex bottom'>
                  <div>
                    <p className="quantity-desc">
                      <span className="minus" onClick={() => {
                        toggleCartItemQuantity(item._id, 'dec')
                      }} ><AiOutlineMinus /></span>
                      <span className="num">{item.quantity}</span>
                      <span className="plus" onClick={() => {
                        toggleCartItemQuantity(item._id, 'inc')
                      }} ><AiOutlinePlus /></span>
                    </p>
                  </div>
                  <button
                    type='button'
                    className='remove-item'
                    onClick={() => {
                      onRemove(item)
                    }}
                  >
                    <TiDeleteOutline />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cartItems.length >= 1 && (
          <div className='cart-bottom'>
            <div className='total'>
              <h3>Subtotal:</h3>
              <h3>${totalPrice}</h3>
            </div>
            <div className='btn-container'>
              {/* <button type='button' className='btn' onClick={handleStripeCheckout} >
                Pay with Stripe
              </button>  */}
              {!loading ? (
                <a href={url}>
                  <div className='btn-mp' >
                    <Image
                      src={ mp_logo }
                      alt='Logo mercado pago'
                      width='200px'
                      height='70px'
                    />
                  </div>
                </a>
              ) : (
                <button type='button' className='btn-mp' disabled >
                  Getting payment link...
                </button>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart