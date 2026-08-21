const loadStockButton = document.getElementById("loadStockButton");
const ingredientInput = document.getElementById("ingredientInput");
const ingredientList = document.getElementById("ingredientList");
const generateButton = document.getElementById("generateButton");

let selectedIngredients = [];

function renderIngredients() {
  ingredientList.innerHTML = "";

  selectedIngredients.forEach((ingredient, index) => {
    const tag = document.createElement("span");
    tag.className = "ingredient-tag";

    tag.textContent = ingredient;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "×";

    removeButton.addEventListener("click", () => {
      selectedIngredients.splice(index, 1);
      renderIngredients();
    });

    tag.appendChild(removeButton);
    ingredientList.appendChild(tag);
  });
}

function addIngredientsFromInput() {
  const value = ingredientInput.value.trim();

  if (!value) {
    return;
  }

  const ingredients = value
    .split(/[、,，\s]+/)
    .map((item) => item.trim())
    .filter((item) => item !== "");

  ingredients.forEach((ingredient) => {
    const alreadyExists = selectedIngredients.some(
      (item) => item === ingredient
    );

    if (!alreadyExists) {
      selectedIngredients.push(ingredient);
    }
  });

  ingredientInput.value = "";
  renderIngredients();
}

ingredientInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addIngredientsFromInput();
  }
});

loadStockButton.addEventListener("click", () => {
  try {
    const stockList =
      JSON.parse(localStorage.getItem("stockList")) || [];

    if (stockList.length === 0) {
      alert("在庫に材料が登録されていません。");
      return;
    }

    stockList.forEach((item) => {
      const ingredientName = item.name?.trim();

      if (!ingredientName) {
        return;
      }

      const alreadyExists = selectedIngredients.some(
        (ingredient) => ingredient === ingredientName
      );

      if (!alreadyExists) {
        selectedIngredients.push(ingredientName);
      }
    });

    renderIngredients();

  } catch (error) {
    console.error("在庫データの読み込みに失敗しました。", error);
    alert("在庫データの読み込みに失敗しました。");
  }
});