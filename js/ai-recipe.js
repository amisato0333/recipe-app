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

generateButton.addEventListener("click", () => {
  if (selectedIngredients.length === 0) {
    alert("材料を1つ以上入力してください。");
    return;
  }

  const prompt = createRecipePrompt(selectedIngredients);

  console.log("AIに送る内容:");
  console.log(prompt);
});


function createRecipePrompt(ingredients) {
  const ingredientText = ingredients.join("、");

  return `
以下の材料を使って作れる料理を1つ提案してください。

【使える材料】
${ingredientText}

以下の形式で回答してください。

【料理名】

【材料】
・材料名：分量

【作り方】
1.
2.
3.

【ポイント】
`;
}