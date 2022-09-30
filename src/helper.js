import Cart from "./models/Cart.js";

export function convertSubCategories(data) {
    const result = [];
    data.forEach((el, i) => {
        if (!el.parent) {
            result.push(el);
        }
    })

    data.forEach((el, i) => {
        result.forEach(e => {
            if (e._id.toString() == el.parent.toString()) {
                e.children.push(el)
            }
        });
    });

    data.forEach(element => {
        result.forEach(el => {
            el.children.forEach(e => {
                if (element.parent == e._id) {
                    e.children.push(element)
                }
            })
        })
    })
    return result;
}

export function calculateCartTotal(cart) {
    cart.total = 0;
    cart.items.forEach(el => {
        cart.total += (+el.qtt) * (+el.sale_price || +el.price)
    })
}

export async function checkUnusedCarts () {
    console.log("check Carts_________________________", currentDate)

    const carts = await Cart.find({userID: null});
    const cartsForDelete = [];

    carts.forEach(cart => {
        const cartDate = new Date(cart.updated_at);
        const currentDate = new Date();
        const time = cartDate.getTime();
        const currentTime = currentDate.getTime();

        //  ---> THE DIFFERENCE IS SO MANY DAYS  <---
        const difTime = (currentTime - time) / (1000 * 60 * 60 * 24);

        if(difTime > 0.04){
            cartsForDelete.push(cart._id)
        }
    });

    await Cart.deleteMany({
        _id: {
            $in: cartsForDelete
        }
    })
}