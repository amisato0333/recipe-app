const backButton = document.getElementById("backButton");
const pageTitle = document.getElementById("pageTitle");
const mealForm = document.getElementById("mealForm");
const mealDate = document.getElementById("mealDate");
const mealType = document.getElementById("mealType");
const mealTime = document.getElementById("mealTime");
const addFoodButton =
    document.getElementById("addFoodButton");
const foodContainer =
    document.getElementById("foodContainer");
const foodItemTemplate =
    document.getElementById("foodItemTemplate");
const messageText =
    document.getElementById("messageText");

const params = new URLSearchParams(
    window.location.search
);

const editMealId = params.get("id");
const dateFromUrl = params.get("date");
const mealTypeFromUrl = params.get("mealType");

let recipes = getRecipes();
let editingMeal = null;

/* =========================
   データ取得
========================= */

function getRecipes() {
    try {
        const savedRecipes =
            localStorage.getItem("recipes");

        return savedRecipes
            ? JSON.parse(savedRecipes)
            : [];
    } catch (error) {
        console.error(
            "レシピの読み込みに失敗しました。",
            error
        );

        return [];
    }
}

function getMealPlans() {
    try {
        const savedMealPlans =
            localStorage.getItem("mealPlans");

        return savedMealPlans
            ? JSON.parse(savedMealPlans)
            : [];
    } catch (error) {
        console.error(
            "献立の読み込みに失敗しました。",
            error
        );

        return [];
    }
}

/* =========================
   日付の整形
========================= */

function formatDate(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/* =========================
   戻る
========================= */

backButton.addEventListener("click", () => {
    returnToMealCalendar();
});

function returnToMealCalendar() {
    const selectedDate =
        mealDate.value || formatDate(new Date());

    window.location.href =
        `meal-list.html?date=${encodeURIComponent(selectedDate)}`;
}

/* =========================
   レシピ選択肢を作成
========================= */

function fillRecipeSelect(selectElement) {
    selectElement.innerHTML = "";

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent =
        recipes.length > 0
            ? "レシピを選択してください"
            : "登録済みレシピがありません";

    selectElement.appendChild(defaultOption);

    recipes.forEach((recipe) => {
        const option =
            document.createElement("option");

        option.value = String(recipe.id);
        option.textContent =
            recipe.title || "タイトルなし";

        selectElement.appendChild(option);
    });
}

/* =========================
   料理入力欄を追加
========================= */

function addFoodItem(foodData = null) {
    const fragment =
        foodItemTemplate.content.cloneNode(true);

    const foodCard =
        fragment.querySelector(".foodCard");

    const removeButton =
        fragment.querySelector(
            ".removeFoodButton"
        );

    const typeButtons =
        fragment.querySelectorAll(
            ".foodTypeButton"
        );

    const recipeArea =
        fragment.querySelector(
            ".recipeFoodArea"
        );

    const customArea =
        fragment.querySelector(
            ".customFoodArea"
        );

    const recipeSelect =
        fragment.querySelector(
            ".recipeSelect"
        );

    const customInput =
        fragment.querySelector(
            ".customFoodInput"
        );

    fillRecipeSelect(recipeSelect);

    let selectedType =
        foodData?.type === "custom"
            ? "custom"
            : "recipe";

    function updateFoodType(type) {
        selectedType = type;

        foodCard.dataset.foodType = type;

        typeButtons.forEach((button) => {
            button.classList.toggle(
                "active",
                button.dataset.type === type
            );
        });

        if (type === "recipe") {
            recipeArea.hidden = false;
            customArea.hidden = true;
        } else {
            recipeArea.hidden = true;
            customArea.hidden = false;
        }
    }

    typeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            updateFoodType(button.dataset.type);
        });
    });

    removeButton.addEventListener("click", () => {
        foodCard.remove();
        updateFoodNumbers();

        if (
            foodContainer.children.length === 0
        ) {
            addFoodItem();
        }
    });

    foodContainer.appendChild(fragment);

    updateFoodType(selectedType);

    if (foodData) {
        if (foodData.type === "recipe") {
            recipeSelect.value =
                foodData.recipeId != null
                    ? String(foodData.recipeId)
                    : "";
        } else {
            customInput.value =
                foodData.title || "";
        }
    }

    updateFoodNumbers();
}

/* =========================
   料理番号を更新
========================= */

function updateFoodNumbers() {
    const foodCards =
        foodContainer.querySelectorAll(
            ".foodCard"
        );

    foodCards.forEach((card, index) => {
        const number =
            card.querySelector(".foodNumber");

        number.textContent =
            `料理${index + 1}`;
    });
}

/* =========================
   入力料理を取得
========================= */

function collectFoods() {
    const foodCards =
        foodContainer.querySelectorAll(
            ".foodCard"
        );

    const foods = [];

    for (const card of foodCards) {
        const type = card.dataset.foodType;

        if (type === "recipe") {
            const recipeSelect =
                card.querySelector(
                    ".recipeSelect"
                );

            const recipeId =
                recipeSelect.value;

            if (!recipeId) {
                throw new Error(
                    "レシピを選択してください。"
                );
            }

            const selectedRecipe =
                recipes.find((recipe) => {
                    return (
                        String(recipe.id) ===
                        String(recipeId)
                    );
                });

            if (!selectedRecipe) {
                throw new Error(
                    "選択したレシピが見つかりません。"
                );
            }

            foods.push({
                type: "recipe",
                recipeId: selectedRecipe.id,
                title:
                    selectedRecipe.title ||
                    "タイトルなし"
            });
        } else {
            const customInput =
                card.querySelector(
                    ".customFoodInput"
                );

            const title =
                customInput.value.trim();

            if (!title) {
                throw new Error(
                    "料理名を入力してください。"
                );
            }

            foods.push({
                type: "custom",
                recipeId: null,
                title
            });
        }
    }

    return foods;
}

/* =========================
   保存
========================= */

mealForm.addEventListener("submit", (event) => {
    event.preventDefault();

    clearMessage();

    try {
        if (!mealDate.value) {
            throw new Error(
                "日付を選択してください。"
            );
        }

        if (!mealType.value) {
            throw new Error(
                "食事区分を選択してください。"
            );
        }

        const foods = collectFoods();

        const mealPlans = getMealPlans();

        const mealData = {
            id: editingMeal
                ? editingMeal.id
                : Date.now(),

            date: mealDate.value,
            mealType: mealType.value,
            time: mealTime.value,
            foods
        };

        let updatedMealPlans;

        if (editingMeal) {
            updatedMealPlans =
                mealPlans.map((meal) => {
                    return String(meal.id) ===
                        String(editingMeal.id)
                        ? mealData
                        : meal;
                });
        } else {
            updatedMealPlans = [
                ...mealPlans,
                mealData
            ];
        }

        localStorage.setItem(
            "mealPlans",
            JSON.stringify(updatedMealPlans)
        );

        showMessage(
            editingMeal
                ? "献立を更新しました。"
                : "献立を保存しました。",
            "success"
        );

        setTimeout(() => {
            returnToMealCalendar();
        }, 400);
    } catch (error) {
        console.error(error);

        showMessage(
            error.message ||
                "保存に失敗しました。",
            "error"
        );
    }
});

/* =========================
   編集データを読み込む
========================= */

function loadEditingMeal() {
    if (!editMealId) {
        return false;
    }

    const mealPlans = getMealPlans();

    editingMeal = mealPlans.find((meal) => {
        return String(meal.id) ===
            String(editMealId);
    });

    if (!editingMeal) {
        showMessage(
            "編集する献立が見つかりません。",
            "error"
        );

        return false;
    }

    pageTitle.textContent = "献立を編集";

    mealDate.value =
        editingMeal.date ||
        formatDate(new Date());

    mealType.value =
        editingMeal.mealType || "朝食";

    mealTime.value =
        editingMeal.time || "";

    const foods =
        Array.isArray(editingMeal.foods)
            ? editingMeal.foods
            : [];

    if (foods.length > 0) {
        foods.forEach((food) => {
            addFoodItem(food);
        });
    } else {
        addFoodItem();
    }

    return true;
}

/* =========================
   メッセージ
========================= */

function showMessage(text, type) {
    messageText.textContent = text;

    messageText.classList.remove(
        "errorMessage",
        "successMessage"
    );

    if (type === "error") {
        messageText.classList.add(
            "errorMessage"
        );
    }

    if (type === "success") {
        messageText.classList.add(
            "successMessage"
        );
    }
}

function clearMessage() {
    messageText.textContent = "";

    messageText.classList.remove(
        "errorMessage",
        "successMessage"
    );
}

/* =========================
   料理追加ボタン
========================= */

addFoodButton.addEventListener("click", () => {
    addFoodItem();
});

/* =========================
   初期表示
========================= */

const editingLoaded = loadEditingMeal();

if (!editingLoaded) {
    mealDate.value =
        dateFromUrl ||
        formatDate(new Date());

    if (mealTypeFromUrl) {
        mealType.value = mealTypeFromUrl;
    }

    addFoodItem();
}