console.log("レシピ管理アプリ");

const todayText = document.getElementById("todayText");
const weekCalendar = document.getElementById("weekCalendar");

const today = new Date();

const year = today.getFullYear();
const month = today.getMonth() + 1;
const date = today.getDate();

const weekNames = ["日", "月", "火", "水", "木", "金", "土"];
const day = today.getDay();

todayText.textContent = `${year}.${String(month).padStart(2, "0")}.${String(date).padStart(2, "0")}`;

for (let i = -3; i <= 3; i++) {
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + i);

  const item = document.createElement("div");

  item.innerHTML = `
    <span>${weekNames[targetDate.getDay()]}</span>
    <strong>${targetDate.getDate()}</strong>
  `;

  if (i === 0) {
    item.classList.add("today");
  }

  weekCalendar.appendChild(item);
}

const recipeAddButton = document.getElementById("recipeAddButton");

if(recipeAddButton)
  recipeAddButton.addEventListener("click", () => {
  location.href = "recipeAdd.html";  
});

const recipeListButton = document.getElementById("recipeListButton");

recipeListButton.addEventListener("click", () => {
    window.location.href = "recipe-list.html";
});

const photoListButton = document.getElementById("photoListButton");

const backupButton = document.getElementById("backupButton");

if (backupButton) {
    backupButton.addEventListener("click", () => {
        window.location.href = "backup.html";
    });
}

photoListButton.addEventListener(
    "click",
    () => {
        window.location.href =
            "photo-list.html";
    }
);

const mealListButton = document.getElementById("mealListButton");

if (mealListButton) {
    mealListButton.addEventListener("click", () => {
        window.location.href = "meal-list.html";
    });
}

const shoppingListButton = 
    document.getElementById("shoppingListButton");

if(shoppingListButton){
    shoppingListButton.addEventListener("click", () =>{
        window.location.href = "shopping-list.html";
    });
}

const stockListButton =
    document.getElementById("stockListButton");

if (stockListButton) {
    stockListButton.addEventListener("click", () => {
        window.location.href = "stock-list.html";
    });
}

const recipeSuggestButton =
    document.getElementById("recipeSuggestButton");

if (recipeSuggestButton) {
    recipeSuggestButton.addEventListener("click", () => {
        window.location.href = "recipe-suggest.html";
    });
}

const aiRecipeButton =
  document.getElementById("aiRecipeButton");

if (aiRecipeButton) {
  aiRecipeButton.addEventListener("click", () => {
    window.location.href = "ai-recipe.html";
  });
}
