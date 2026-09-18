const loadStockButton = document.getElementById("loadStockButton");
const ingredientInput = document.getElementById("ingredientInput");
const ingredientList = document.getElementById("ingredientList");
const generateButton = document.getElementById("generateButton");
const loadingMessage = document.getElementById("loadingMessage");
const aiResult = document.getElementById("aiResult");
const aiRecipeActions = document.getElementById("aiRecipeActions");
const saveAiRecipeButton = document.getElementById("saveAiRecipeButton");
const addAiMealPlanButton = document.getElementById("addAiMealPlanButton");
const aiMealPlanForm = document.getElementById("aiMealPlanForm");
const aiMealPlanDate = document.getElementById("aiMealPlanDate");
const aiMealPlanType = document.getElementById("aiMealPlanType");
const confirmAiMealPlanButton = document.getElementById("confirmAiMealPlanButton");

let selectedIngredients = [];

let currentAiRecipe = null;
let savedAiRecipeId = null;

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

generateButton.addEventListener("click", async () => {
  addIngredientsFromInput();

  if (selectedIngredients.length === 0) {
    alert("材料を1つ以上入力してください。");
    return;
  }

  loadingMessage.hidden = false;
  aiResult.innerHTML = "";
  aiRecipeActions.hidden = true;

  try {
    const response = await fetch(
      "https://recipe-gemini-api.zuotengyahai177.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ingredients: selectedIngredients
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Workerエラー:", data);
      throw new Error(
        data.details ||
        data.error ||
        "AIからレシピを取得できませんでした。"
      );
    }

    console.log("AIから返ってきたデータ:", data);

    const recipes = data.recipes;

    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error("レシピデータがありません。");
    }

    console.log("生成されたレシピ:", recipes);
    console.log("1品目の材料データ:", recipes[0].ingredients);

    displayAIRecipe(recipes[0]);

  } catch (error) {
    console.error("AIレシピ生成エラー:", error);

    aiResult.innerHTML = `
            <p class="error-message">
                レシピの生成に失敗しました。<br>
                ${error.message}
            </p>
        `;
  } finally {
    loadingMessage.hidden = true;
  }
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
  currentAiRecipe = recipe;

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

    li.textContent = ingredient;

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

  aiRecipeActions.hidden = false;

}

saveAiRecipeButton.addEventListener("click", () => {

  if (!currentAiRecipe) {
    alert("保存するレシピがありません。");
    return;
  }

  const savedRecipes =
    JSON.parse(localStorage.getItem("recipes")) || [];

  const recipeId = Date.now();

  const newRecipe = {
    id: recipeId,
    title: currentAiRecipe.title,
    titleKana: "",
    images: [],
    ingredients: currentAiRecipe.ingredients,
    steps: currentAiRecipe.steps,
    tag: "なし",
    createdAt: new Date().toISOString()
  };

  savedRecipes.push(newRecipe);

  localStorage.setItem(
    "recipes",
    JSON.stringify(savedRecipes)
  );

  savedAiRecipeId = recipeId;

  alert("レシピを保存しました！");
});

addAiMealPlanButton.addEventListener("click", () => {
  console.log("献立に追加ボタンが押されました");

  aiMealPlanForm.style.display = "block";

  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  aiMealPlanDate.value =
    `${year}-${month}-${day}`;

  console.log("献立フォームを表示しました");
});

confirmAiMealPlanButton.addEventListener("click", () => {

  if (!currentAiRecipe) {
    alert("献立に追加するレシピがありません。");
    return;
  }

  const selectedDate = aiMealPlanDate.value;
  const selectedMealType = aiMealPlanType.value;

  if (!selectedDate) {
    alert("日付を選択してください。");
    return;
  }

  // ===================================
  // AIレシピが未保存の場合だけ保存する
  // ===================================

  let recipeId = savedAiRecipeId;

  if (recipeId === null) {

    const savedRecipes =
      JSON.parse(localStorage.getItem("recipes")) || [];

    recipeId = Date.now();

    const newRecipe = {
      id: recipeId,
      title: currentAiRecipe.title,
      titleKana: "",
      images: [],
      ingredients: currentAiRecipe.ingredients,
      steps: currentAiRecipe.steps,
      tag: "なし",
      createdAt: new Date().toISOString()
    };

    savedRecipes.push(newRecipe);

    localStorage.setItem(
      "recipes",
      JSON.stringify(savedRecipes)
    );

    // 保存したIDを覚えておく
    savedAiRecipeId = recipeId;
  }

  // 献立に追加する
  const mealPlans =
    JSON.parse(localStorage.getItem("mealPlans")) || [];

  const newMeal = {
    id: Date.now() + 1,
    date: selectedDate,
    mealType: selectedMealType,
    time: "",
    foods: [
      {
        type: "recipe",
        title: currentAiRecipe.title,
        recipeId: recipeId
      }
    ]
  };

  mealPlans.push(newMeal);

  localStorage.setItem(
    "mealPlans",
    JSON.stringify(mealPlans)
  );

  alert("献立に追加しました！");

  aiMealPlanForm.style.display = "none";
});