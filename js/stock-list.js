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

    stockList.forEach((item) =>{
        const li = document.createElement("li");

        const name = document.createElement("span");
        name.textContent = item.name;

        const amount = document.createElement("span");
        amount.textContent = item.amount;

        li.appendChild(name);
        li.appendChild(amount);

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

    stockList.push({
        name: name,
        amount: amount
    });

    saveStockList();
    renderStockList();

    stockNameInput.value = "";
    stockAmountInput.value = "";
});

renderStockList();