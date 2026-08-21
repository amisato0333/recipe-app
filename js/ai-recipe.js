const loadStockButton = document.getElementById("loadStockButton");
const ingredientInput = document.getElementById("ingredientInput");
const ingredientList = document.getElementById("ingredientList");
const generateButton = document.getElementById("generateButton");
const loadingMessage = document.getElementById("loadingMessage");
const aiResult = document.getElementById("aiResult");

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

  // 将来AIに送るプロンプト
  const prompt = createRecipePrompt(selectedIngredients);

  console.log("AIに送る内容:");
  console.log(prompt);

  // 読み込み表示
  loadingMessage.hidden = false;
  aiResult.innerHTML = "";

  // 今はAI APIを使わないため、仮の回答を表示
  setTimeout(() => {
    const mockRecipe = createMockRecipe(selectedIngredients);

    displayAIRecipe(mockRecipe);

    loadingMessage.hidden = true;
  }, 800);
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

function createMockRecipe(ingredients) {
  return {
    title: "材料を活用した簡単炒め",

    ingredients: ingredients.map((ingredient) => ({
      name: ingredient,
      amount: "適量"
    })),

    steps: [
      "材料を食べやすい大きさに切ります。",
      "フライパンを熱し、材料を炒めます。",
      "塩・こしょうなどで味を調えます。",
      "火が通ったら器に盛り付けて完成です。"
    ],

    point:
      "これはAI API接続前の仮レシピです。実際のAI接続後は、選択した材料に応じたレシピが生成されます。"
  };
}

function displayAIRecipe(recipe) {
  aiResult.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = recipe.title;
  aiResult.appendChild(title);

  const ingredientHeading = document.createElement("h4");
  ingredientHeading.textContent = "材料";
  aiResult.appendChild(ingredientHeading);

  const ingredientList = document.createElement("ul");

  recipe.ingredients.forEach((ingredient) => {
    const li = document.createElement("li");

    li.textContent =
      `${ingredient.name}：${ingredient.amount}`;

    ingredientList.appendChild(li);
  });

  aiResult.appendChild(ingredientList);


  const stepHeading = document.createElement("h4");
  stepHeading.textContent = "作り方";
  aiResult.appendChild(stepHeading);

  const stepList = document.createElement("ol");

  recipe.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;

    stepList.appendChild(li);
  });

  aiResult.appendChild(stepList);


  const pointHeading = document.createElement("h4");
  pointHeading.textContent = "ポイント";
  aiResult.appendChild(pointHeading);

  const point = document.createElement("p");
  point.textContent = recipe.point;

  aiResult.appendChild(point);

  // ==============================
  // AIレシピを保存
  // ==============================

  const saveButton = document.createElement("button");

  saveButton.type = "button";
  saveButton.textContent = "📖 このレシピを保存";
  saveButton.className = "save-ai-recipe-button";

  saveButton.addEventListener("click", () => {
    const savedRecipes =
        JSON.parse(localStorage.getItem("recipes")) || [];

    const newRecipe = {
        id: Date.now(),
        title: recipe.title,
        titleKana: "",
        images: [],
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        tag: "なし",
        createdAt: new Date().toISOString()
    };

    savedRecipes.push(newRecipe);

    localStorage.setItem(
        "recipes",
        JSON.stringify(savedRecipes)
    );

        alert("レシピを保存しました！");
    });

  aiResult.appendChild(saveButton);
}