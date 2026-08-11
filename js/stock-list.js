const backButton = document.getElementById("backButton");

if(backButton){
    backButton.addEventListener("click", () =>{
        window.location.href = "index.html";
    });
}

const STOCK_STORAGE_KEY = "stockList";

let stockList = 
    JSON.parse(localStorage.getItem(STOCK_STORAGE_KEY)) || [];

const stockNameInput = 
    document.getElementById("stockNameInput");

const stockAmountInput = 
    document.getElementById("stockAmountInput");

const addStockButton = 
    document.getElementById("addStockButton")

const stockListElement = 
    document.getElementById("stockList");

const emptyMessage = 
    document.getElementById("emptyMessage");

let editingIndex = null;

/**
 * 保存用関数
 */
function saveStockList(){
    localStorage.setItem(
        STOCK_STORAGE_KEY,
        JSON.stringify(stockList)
    );
}

/**
 * 表示用関数
 */
function renderStockList(){
    stockListElement.innerHTML = "";

    if(stockList.length === 0){
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    stockList.forEach((item,index) =>{
        const li = document.createElement("li");

        const itemInfo = document.createElement("div");
        itemInfo.classList.add("stockItemInfo");

        const name = document.createElement("span");
        name.classList.add("stockName");
        name.textContent = item.name;

        const amount = document.createElement("span");
        amount.classList.add("stockAmount");
        amount.textContent = item.amount;

        itemInfo.appendChild(name);
        itemInfo.appendChild(amount);

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.classList.add("deleteStockButton");
        deleteButton.textContent = "削除"

        deleteButton.addEventListener("click", () =>{
            const shouldDelete = 
                window.confirm(
                    `${item.name}を在庫から削除しますか？`
                );

            if(!shouldDelete){
                return;
            }

            stockList.splice(index, 1);

            saveStockList();
            renderStockList();
        });

        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.classList.add("editStockButton");
        editButton.textContent = "編集"

        editButton.addEventListener("click", () =>{
            stockNameInput.value = item.name;
            stockAmountInput.value = item.amount;

            editingIndex = index;

            addStockButton.textContent = "更新"
        });

        const buttonArea = document.createElement("div");
        buttonArea.classList.add("stockButtonArea");

        buttonArea.appendChild(editButton);
        buttonArea.appendChild(deleteButton);

        li.appendChild(itemInfo);
        li.appendChild(buttonArea);

        stockListElement.appendChild(li);
    });
}

/**
 * 追加ボタン
 */
addStockButton.addEventListener("click", ()=>{
    const name = stockNameInput.value.trim();
    const amount = stockAmountInput.value.trim();

    if(name === ""){
        alert("材料名を入力してください");
        return;
    }

    if(amount === ""){
        alert("在庫量を入力してください");
        return;
    }

    if(editingIndex !== null){
        stockList[editingIndex] = {
            name: name,
            amount: amount
        };

        editingIndex = null;
        addStockButton.textContent = "在庫に追加";
    }else{
        stockList.push({
            name: name,
            amount: amount
        });
    }

    saveStockList();
    renderStockList();

    stockNameInput.value = "";
    stockAmountInput.value = "";
});

renderStockList();