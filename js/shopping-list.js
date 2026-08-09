const STORAGE_KEY = "shoppingList";

let shoppingList = 
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const itemInput = document.getElementById("itemInput");
const addButton = document.getElementById("addButton");
const shoppingListElement = document.getElementById("shoppingList");
const emptyMessage = document.getElementById("emptyMessage");
const backButton = document.getElementById("backButton");
const deleteCheckedButton = document.getElementById("deleteCheckedButton");

function saveShoppingList(){
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(shoppingList)
    );
}

deleteCheckedButton.addEventListener("click", () => {

    shoppingList = shoppingList.filter((item) => {
        return !item.checked;
    });

    saveShoppingList();

    renderShoppingList();

});

function renderShoppingList(){
    shoppingListElement.innerHTML = "";

    if(shoppingList.length === 0){
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    shoppingList.forEach((item, index) =>{
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.checked;

        checkbox.addEventListener("change", () =>{

            shoppingList[index].checked = checkbox.checked;

            saveShoppingList();

            renderShoppingList();
        });

        const itemName = document.createElement("span");
        itemName.textContent = item.name;

        if(item.checked){
            itemName.style.textDecoration = "line-through";
            itemName.style.color = "#999";
        }

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "削除";
        deleteButton.classList.add("deleteButton");

        deleteButton.addEventListener("click", ()=>{
            shoppingList.splice(index, 1);

            saveShoppingList();
            renderShoppingList()
        });

        li.appendChild(checkbox);
        li.appendChild(itemName);
        li.appendChild(deleteButton);

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