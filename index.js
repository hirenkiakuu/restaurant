const cartButton = document.querySelector('.cart');
const cartGoodsList = document.querySelector('.goods-list');
const summaryMoney = document.querySelector('.summary-money');
const cartCount = document.querySelector('.cart');
const filterPanel = document.querySelector('.filter-panel');
const cartWindow = document.querySelector('.cart-content');
const buyButton = document.querySelector('.buy-btn');
let allGoods = [];

const storedCart = localStorage.getItem('goodsInCart');
const initialCart = storedCart ? JSON.parse(storedCart) : [];

function getGoods() {
    fetch('http://localhost:3001/goods')
    .then(res => res.json())
    .then(data => {allGoods = data})
    .then(() => {
        renderGoodsCards(allGoods);
        console.log(allGoods);
    });
}

const cart = {
    cartGoods: initialCart,
    addToCart(idx) {
        console.log(idx);
        const item = this.cartGoods.find(good => good.id === idx);
        if (item) {
            this.increaseGood(idx);
        } else {
            console.log(allGoods);
            const {id, category, title, descripton, price, img} = allGoods.find(good => good.id === idx);
            this.cartGoods.push({id, category, title, descripton, price, img, count: 1});
            this.renderCart();
        }
        this.updateLocalStorage();
    }, 
    increaseGood(idx) {
        const goodToIncrease = this.cartGoods.find(good => good.id === idx);
        if (goodToIncrease) {
            goodToIncrease.count++;
        }
        this.renderCart();
        this.updateLocalStorage();
    }, 
    decreaseGood(idx) {
        const goodToDecrease = this.cartGoods.find(good => good.id === idx);
        if (goodToDecrease) {
            if (goodToDecrease.count === 1) {
                this.deleteGood(idx);
            } else {
                goodToDecrease.count--;
            }
        }
        this.renderCart();
        this.updateLocalStorage();
    },
    deleteGood(idx) {
        this.cartGoods = this.cartGoods.filter(good => good.id !== idx);
        this.renderCart();
        console.log(this.cartGoods);
        this.updateLocalStorage();
    },
    renderCart() {
        cartGoodsList.textContent = '';
        this.cartGoods.forEach(({title, id, price, count, img}) => {
            const good = document.createElement('li');
            good.className = 'goods-list__item';
            good.dataset.id = id;
            good.innerHTML =   `
            <img src="${img}" alt="" class="good__item-img">
            <div class="good__item-middle">
                <h2 class="good__item-title">${title}</h2>
                <div class="good__item-quantity-control">
                    <div class="good__item-quantity-minus">-</div>
                    <p class="quantity">${count}</p>
                    <div class="good__item-quantity-plus">+</div>
                </div>
            </div>
            <div class="good__item-right">
                <div class="good__item-delete">
                    <img src="img/bin.png" alt="" class="delete-img">
                </div>
                <p class="good__item-price">${price} ₽</p>
            </div>
            `;

            // if (this.cartGoods.length) {
            //     buyButton.classList.remove('unactive');
            // }
            this.cartGoods.length ? buyButton.classList.remove('unactive') : buyButton.classList.add('unactive');
            
            cartGoodsList.append(good);
        });

        
        cartCount.textContent = `Корзина | ${this.cartGoods.reduce((sum, good) => sum + good.count, 0)}`;
        const totalPrice = this.cartGoods.reduce((sum, good) => sum + good.price * good.count, 0);
        summaryMoney.textContent = `${totalPrice} ₽`;
    },
    updateLocalStorage() {
        localStorage.setItem('goodsInCart', JSON.stringify(this.cartGoods));
    }
}

if (initialCart) {
    cart.renderCart();
}

cartGoodsList.addEventListener('click', (e) => {
    const target = e.target;
    const goodId = target.closest('.goods-list__item').dataset.id;
    if (target.parentNode.classList.contains('good__item-delete')) {
        cart.deleteGood(goodId);
    }
    else if (target.classList.contains('good__item-quantity-minus')) {
        cart.decreaseGood(goodId);
    }
    else if (target.classList.contains('good__item-quantity-plus')) {
        cart.increaseGood(goodId);
    }
});

function createGoodCard(objGood) {
    const card = document.createElement('li');
    card.classList.add('goods-card');
    card.dataset.id = objGood.id;

    card.innerHTML = `
        <img src="${objGood.img}" width="253" height="253" alt="" class="good-img">
        <h3 class="good-title">${objGood.title}</h3>
        <p class="good-description">
            ${objGood.description}
        </p>
        <div class="good-add-to-cart">
            <p class="good-price">от ${objGood.price} ₽</p>
            <div class="add-to-cart-btn">В корзину</div>
        </div>
    `;

    return card;
}

function renderGoodsCards(goodsArray) {
    const goodsList = document.querySelector('.goods-cards-list');
    goodsList.textContent = '';
    const goodsCards = goodsArray.map(good => createGoodCard(good));
    goodsList.append(...goodsCards);
}


function filterGoods(field, value) {
    renderGoodsCards(allGoods.filter(good => good[field] === value));
    console.log(1);
}

const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(btn => {
    btn.addEventListener('click', handleFilterClick);
});

filterPanel.addEventListener('click', (e) => {
    target = e.target;
    if (target.tagName === 'DIV' && !target.classList.contains('filter-panel')) {
        filterButtons.forEach(btn => btn.classList.remove('active'));
    }
    target.classList.add('active');
});

function handleFilterClick(event) {
    const clickedButton = event.target;
    if (clickedButton.dataset.category === 'all') {
        
        renderGoodsCards(allGoods);
        return;
    }
   
    filterGoods('category', clickedButton.dataset.category);
}

cartButton.addEventListener('click', () => {
    document.querySelector('.overlay').classList.add('active');
    document.querySelector('.cart-popup').classList.add('active');
    console.log(cart.cartGoods);
});

document.addEventListener('mouseup', (e) => {
    const target = e.target;
    const modalCart = document.querySelector('.cart-popup');
    const overlay = document.querySelector('.overlay');
    if (!target.closest('.cart-popup')) {
        if (modalCart.classList.contains('active')) {
            modalCart.classList.remove('active');
        }
        if (overlay.classList.contains('active')) {
            overlay.classList.remove('active');
        }
    }
});


document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('add-to-cart-btn')) {
        const clickedGoodId = target.closest('.goods-card').dataset.id;
        cart.addToCart(clickedGoodId);
    }
});

getGoods()