const incrementBtn = document.querySelectorAll(".increment-btn");
const waffleBtn = document.querySelectorAll(".waffle-button");
const plusBtn = document.querySelectorAll(".increment-quantity");
const minusBtn = document.querySelectorAll(".decrement-quantity");
const quantity = document.querySelectorAll(".quantity");
const cartQuantity = document.querySelector(".cart-quantity");
const cartSection = document.querySelector(".cart-section");
const emptyCart = document.querySelector(".empty-cart");
const orderButton = document.querySelector(".order-button");
const modalOverlay = document.querySelector(".modal-overlay");
const foodSection = document.querySelector(".food-section");
const lastButton = document.querySelector(".last-button");

const cart = {}
fetch('data.json')
.then(res => res.json())
.then(data => {
  //const item = data[0];
  data.forEach((item, index) => {
    document.getElementById(`name-${index}`).textContent = item.name;
    document.getElementById(`price-${index}`).textContent = "$" + item.price.toFixed(2);
    document.getElementById(`category-${index}`).textContent = item.category;
    
    document.getElementById(`image-${index}`).srcset = item.image.desktop;
    document.getElementById(`image-${index}`).src = item.image.mobile;
    document.getElementById(`image-tablet-${index}`).srcset = item.image.tablet;


   

    // 👇 Stamp the name & price onto the plus/minus buttons right here
      plusBtn[index].dataset.name = item.name;
      plusBtn[index].dataset.price = item.price;
      plusBtn[index].dataset.image = item.image.thumbnail;
      minusBtn[index].dataset.name = item.name;
      minusBtn[index].dataset.price = item.price;
  })
});
waffleBtn.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".image-container");
    const increment = card.querySelector(".increment-btn");
    const image = document.getElementById(`image-${index}`);
    image.style.border = "2px solid red";
    btn.style.display = "none";
    increment.style.display = "block";
  });
});
incrementBtn.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".image-container");
    const image = document.getElementById(`image-${index}`);
    const waffle = card.querySelector(".waffle-button");
    btn.style.display = "none";
    waffle.style.display = "block";
    image.style.border = "none";
  });
});

let totalItems = 0;
plusBtn.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const all = btn.parentElement;
    const quantityEl = all.querySelector(".quantity");
    const currentNumber = parseInt(quantityEl.textContent);
    quantityEl.textContent = currentNumber + 1;
    cartSection.style.display = "block";
    emptyCart.style.display = "none";

    // Read identity from the button itself
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    const image = btn.dataset.image;

    // Update cart object
    if (cart[name]) {
      cart[name].qty += 1;
    } else {
      cart[name] = { price, qty: 1, image };
    }

    //update carts by imcreasing items
    totalItems++;
    cartQuantity.textContent = `Your Cart (${totalItems})`;
    renderCart();
  });
});

minusBtn.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const all = btn.parentElement;
    const quantityE2 = all.querySelector(".quantity");
    const currentNumber = parseInt(quantityE2.textContent);
    const name = btn.dataset.name;

    if (currentNumber === 1) {
      const card = all.closest(".image-container");
      const waffleButton = card.querySelector(".waffle-button");
      const imageEl = card.querySelector("img");
      all.style.display = "none";
      waffleButton.style.display = "inline-block";
      quantityE2.textContent = 1;
      imageEl.style.border = "none";
      totalItems--;
      delete cart[name];
      
      if (Object.keys(cart).length === 0) {
        cartSection.style.display = "none";
        emptyCart.style.display = "block";
      }

    } else {
      quantityE2.textContent = currentNumber - 1;
      cart[name].qty -= 1;
      totalItems--;
    }

    cartQuantity.textContent = `Your Cart (${totalItems})`;
    renderCart();
  });
});
function renderCart() {
  console.log("Cart state:", cart);

  const productPurchased = document.querySelector(".product-purchased");
  const orderTotalEl = document.querySelector(".total-container p:last-child");

  // Clear existing items
  productPurchased.innerHTML = "";

  let orderTotal = 0;

  // Loop through cart and build each row
  Object.entries(cart).forEach(([name, { price, qty}]) => {
    const itemTotal = price * qty;
    orderTotal += itemTotal;

    productPurchased.innerHTML += `
      <div class="cart-item">
        <p class="cart-item-name">${name}</p>
        <div class="price-container">
          <div class="span-container">
            <span class="cart-qty">${qty}x</span>
            <span class="cart-unit-price">@$${price.toFixed(2)}</span>
            <span class="cart-item-total">$${itemTotal.toFixed(2)}</span>
          </div>
          <div>
            <img class="remove-item" src="assets/images/icon-remove-item.svg" alt="icon-remove-item" data-name="${name}">
          </div>
        </div>
      </div>
      <hr>
    `;
  });

  // Update order total
  orderTotalEl.textContent = `$${orderTotal.toFixed(2)}`;

  document.querySelectorAll(".remove-item").forEach(icon => {
  icon.addEventListener("click", () => {
    const name = icon.dataset.name;
    totalItems -= cart[name].qty;
    delete cart[name];
    cartQuantity.textContent = `Your Cart (${totalItems})`;

    // Find the card that matches this product and reset it
    document.querySelectorAll(".waffle-button").forEach((waffleButton, i) => {
      const nameEl = document.getElementById(`name-${i}`);
      if (nameEl && nameEl.textContent === name) {
        const card = waffleButton.closest(".image-container");
        const incrementDiv = card.querySelector(".increment-btn");
        const quantityEl = card.querySelector(".quantity");
        const imageEl = document.getElementById(`image-${i}`);

        // Reset card back to original state
        waffleButton.style.display = "inline-block";
        incrementDiv.style.display = "none";
        quantityEl.textContent = 1;
        imageEl.style.border = "none";
      }
    });

    renderCart();

    if (Object.keys(cart).length === 0) {
      cartSection.style.display = "none";
      emptyCart.style.display = "block";
    }
  });
});
};

orderButton.addEventListener('click', () => {
  modalOverlay.style.display = "flex";
  renderModal();
});

function renderModal() {
  const foodSection = document.querySelector(".food-section");
  const modalOrderFood = document.querySelector(".last-section h2");

  // Clear existing hardcoded items
  foodSection.innerHTML = "";

  let orderTotal = 0;

  Object.entries(cart).forEach(([name, { price, qty, image }]) => {
    const itemTotal = price * qty;
    orderTotal += itemTotal;

    foodSection.innerHTML += `
      <section>
        <div class="food-name">
          <img src="${image}" alt="${name}">
          <p class="product-name">${name}</p>
          <p class="product-price">$${price.toFixed(2)}</p>
        </div>
        <div class="receipt-price">
          <span>${qty}x</span>
          <span>@$${price.toFixed(2)}</span>
          <hr>
        </div>
      </section>
    `;
  });

  // Add order total at the bottom
  foodSection.innerHTML += `
    <section class="last-section">
      <p>Order Total</p>
      <h2>$${orderTotal.toFixed(2)}</h2>
    </section>
  `;
}

lastButton.addEventListener( "click", () => {
  modalOverlay.style.display = "none";
  cartSection.style.display = "none"
  emptyCart.style.display = "block";

  Object.keys(cart).forEach(key => delete cart[key]);

  waffleBtn.forEach((btn, i) => {
    const card = btn.closest(".image-container");
    const incrementDiv = card.querySelector(".increment-btn");
    const quantityEl = card.querySelector(".quantity");
    const imageEl = document.getElementById(`image-${i}`);

    btn.style.display = "inline-block";
    incrementDiv.style.display = "none";
    quantityEl.textContent = 1;
    imageEl.style.border = "none";
  })
  
  totalItems = 0;
  cartQuantity.textContent = `Your Cart(0)`;

  

  renderCart();
});