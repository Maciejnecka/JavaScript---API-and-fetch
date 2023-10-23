import './../css/client.css';
import ExcursionsAPI from './ExcursionsAPI';
const excursionsAPI = new ExcursionsAPI();

const cart = [];

const excursionsList = document.querySelector('.panel__excursions');
excursionsList.addEventListener('submit', addToCart);

const orderForm = document.querySelector('.panel__order');
orderForm.addEventListener('submit', handleOrderForm);

function renderCart() {
  const cartList = document.querySelector('.panel__summary');
  cartList.innerHTML = '';

  const totalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalValue = document.querySelector('.order__total-price-value');
  totalValue.textContent = totalPrice + ' PLN';

  cart.forEach((item, index) => {
    const cartItem = document.createElement('li');
    cartItem.innerHTML = `
      <h3 class="summary__title">
        <span class="summary__name">${item.title}</span>
        <strong class="summay__total-price">${item.totalPrice} PLN</strong>
           <a href="#" class="summary__btn-remove" title="usuń" data-item-index="${index}">X</a>
      </h3>
      <p class="summary__prices">dorośli: ${item.adults} x ${item.adultPrice} PLN, dzieci: ${item.children} x ${item.childPrice} PLN</p>
    `;
    cartList.appendChild(cartItem);
  });

  const removeButtons = document.querySelectorAll('.summary__btn-remove');
  removeButtons.forEach((button) => {
    button.addEventListener('click', removeCartItem);
  });
}

function addToCart(event) {
  event.preventDefault();

  const form = event.target;
  const adultsInput = form.querySelector(
    '.excursions__field-input[name="adults"]'
  );
  const adultPriceInput = form.querySelector('.excursions__field--adult-price');

  const childrenInput = form.querySelector(
    '.excursions__field-input[name="children"]'
  );
  const childPriceInput = form.querySelector('.excursions__field--child-price');

  const excursionItem = form.closest('.excursions__item');
  const title = excursionItem.querySelector('.excursions__title').textContent;

  const adults = parseInt(adultsInput.value);
  const adultPrice = parseInt(adultPriceInput.textContent);
  const children = parseInt(childrenInput.value);
  const childPrice = parseInt(childPriceInput.textContent);

  if (isValidQuantity(adults) && isValidQuantity(children)) {
    alert('Proszę wprowadzić poprawną ilość dorosłych lub dzieci.');
    return;
  }

  const totalPrice =
    (isNaN(adults) ? 0 : adults) * adultPrice +
    (isNaN(children) ? 0 : children) * childPrice;

  if (totalPrice > 0) {
    const cartItem = {
      title,
      adults: isNaN(adults) ? 0 : adults,
      adultPrice,
      children: isNaN(children) ? 0 : children,
      childPrice,
      totalPrice,
    };
    cart.push(cartItem);
    resetExcursionsInput(adultsInput, childrenInput);
    renderCart();
  } else {
    alert('Proszę wprowadzić poprawną ilość dorosłych lub dzieci.');
  }
}

function isValidQuantity(quantity) {
  return isNaN(quantity) || quantity <= 0;
}

function removeCartItem(e) {
  e.preventDefault();
  const itemIndex = e.target.getAttribute('data-item-index');
  if (itemIndex !== null) {
    cart.splice(itemIndex, 1);
    renderCart();
  }
}

function getFormErrors(name, email, cart) {
  const errors = [];
  const fields = [
    {
      name: 'name',
      label: 'Imię i nazwisko',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      required: true,
      pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
    },
  ];

  if (cart.length === 0) {
    errors.push('Nie można złożyć zamówienia. Proszę wybrać bilet.');
  }

  fields.forEach(function (field) {
    const value = field.name === 'name' ? name : email;

    if (field.required) {
      if (value.trim().length === 0) {
        errors.push('Dane w polu ' + field.label + ' są wymagane.');
      }
    }
    if (field.pattern) {
      const reg = field.pattern;
      if (!reg.test(value)) {
        errors.push(
          'Dane w polu ' +
            field.label +
            ' zawierają niedozwolone znaki, lub nie są zgodne z przyjętym wzorcem.'
        );
      }
    }
  });
  return errors;
}

function resetExcursionsInput(adultsInput, childrenInput) {
  adultsInput.value = '';
  childrenInput.value = '';
}

function handleOrderForm(e) {
  e.preventDefault();
  const nameInput = orderForm.querySelector('.order__field-input[name="name"]');
  const emailInput = orderForm.querySelector(
    '.order__field-input[name="email"]'
  );
  const name = nameInput.value;
  const email = emailInput.value;

  const formErrors = getFormErrors(name, email, cart);
  if (formErrors.length > 0) {
    alert(formErrors.join('\n'));
    return;
  }

  const orderData = {
    name,
    email,
    items: cart,
    total: cart.reduce((sum, item) => sum + item.totalPrice, 0),
  };

  sendOrderToAPI(orderData, nameInput, emailInput);
}

async function sendOrderToAPI(orderData, nameInput, emailInput) {
  try {
    const response = await excursionsAPI.sendOrder(orderData);
    if (response) {
      alert('Zamówienie zostało wysłane pomyślnie!');
      cart.length = 0;
      renderCart();
      resetFormInput(nameInput, emailInput);
    }
  } catch (error) {
    console.error(error);
    alert('Wystąpił błąd podczas komunikacji z serwerem.');
  }
}

function resetFormInput(nameInput, emailInput) {
  nameInput.value = '';
  emailInput.value = '';
}
