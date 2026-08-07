const STORAGE_KEY = "shoppingList";

let shoppingList = 
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const itemInput = document.getElementById("itemInput");
const addButton = document.getElementById("addButton");
const shoppingListElement = document.getElementById("shoppingList");
const emptyMessage = document.getElementById("emptyMessage");
const backButton = document.getElementById("backButton");

function saveShoppingList(){
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(shoppingList)
    );
}

function renderShoppingList(){
    shoppingListElement.innerHTML = "";

    if(shoppingList.length === 0){
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    shoppingList.forEach((item) =>{
        const li = document.createElement("li");

        li.textContent = item.name;

        shoppingListElement.appendChild(li);
    });
}

if(backButton){
    backButton.addEventListener("click", ()=>{
        window.location.href = "index.html";
    });
}

addButton.addEventListener("click", () => {

    const name = itemInput.value.trim();

    if (name === "") {

        alert("商品名を入力してください。");
        return;

    }

    shoppingList.push({

        name: name,
        checked: false

    });

    saveShoppingList();

    renderShoppingList();

    itemInput.value = "";

});

renderShoppingList();