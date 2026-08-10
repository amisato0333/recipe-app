"use strict";

const STORAGE_KEY = "recipes"

const recipeDetailElement = 
    document.getElementById("recipe-detail");

const notFoundMessageElement = 
    document.getElementById("not-found-message");

const recipeTitleElement = 
    document.getElementById("recipe-title");

const recipeTagElement = 
    document.getElementById("recipe-tag");

const imageSectionElement = 
    document.getElementById("image-section");

const recipeImageElement = 
    document.getElementById("recipe-image");

const imageCountElement = 
    document.getElementById("image-count");

const previousImageButton =
    document.getElementById("previous-image-button");

const nextImageButton =
    document.getElementById("next-image-button");

const ingredientListElement = 
    document.getElementById("ingredient-list");

const ingredientEmptyMessageElement = 
    document.getElementById("ingredient-empty-message");

const stepListElement = 
    document.getElementById("step-list");

const stepEmptyMessageElement = 
    document.getElementById("step-empty-message");

const editButton = 
    document.getElementById("edit-button");

const deleteButton = 
    document.getElementById("delete-button");

const addToShoppingListButton =
    document.getElementById("addToShoppingListButton");

let recipes = [];
let selectedRecipe = null;
let selectedRecipeIndex = -1;

let recipeImages = [];
let currentImageIndex = 0;

/**
 * LocalStorageから全レシピを読み込む
 */
function loadRecipes(){
    try{
        const savedRecipes = 
            localStorage.getItem(STORAGE_KEY);

        if(!savedRecipes){
            return [];
        }

        const parsedRecipes = 
            JSON.parse(savedRecipes);

        if(!Array.isArray(parsedRecipes)){
            return [];
        }

        return parsedRecipes;
    } catch(error){
        console.error(
            "レシピの読み込みに失敗しました。",
            error
        );

        return [];
    }
}

/**
 * URLからレシピIDを取得する
 *
 * 例：
 * recipe-detail.html?id=123456
 */
function getRecipeIdFromUrl(){
    const urlParameters = 
        new URLSearchParams(window.location.search);

    return urlParameters.get("id");
}

/**
 * URLのIDに一致するレシピを探す
 */
function findSelectedRecipe(recipeId) {
    if (recipeId === null) {
        return {
            recipe: null,
            index: -1
        };
    }

    /**
     * idが保存されている場合は、
     * そのidとURLのidを比較する。
     */
    const recipeIndex = recipes.findIndex((recipe) => {
        if (
            recipe.id !== undefined &&
            recipe.id !== null
        ) {
            return String(recipe.id) === String(recipeId);
        }

        return false;
    });

    if (recipeIndex !== -1) {
        return {
            recipe: recipes[recipeIndex],
            index: recipeIndex
        };
    }


    /*
     * 古いデータなどでidがない場合は、
     * 配列の番号として探す。
     */
    const possibleIndex = Number(recipeId);

    if (
        Number.isInteger(possibleIndex) &&
        possibleIndex >= 0 &&
        possibleIndex < recipes.length
    ) {
        return {
            recipe: recipes[possibleIndex],
            index: possibleIndex
        };
    }

    return {
        recipe: null,
        index: -1
    };
}

/**
 * 値を表示用の文字列に変える
 */
function getDisplayText(value){
    if(
        value === undefined ||
        value === null
    ){
        return "";
    }

    return String(value).trim();
}

/**
 * 写真データを取り出す
 */
function getRecipeImages(recipe){
    if(Array.isArray(recipe.images)){
        return recipe.images.filter(Boolean);
    }

    /*
     * 過去にrecipeImagesという名前で
     * 保存していた場合にも対応する。
     */
    if(Array.isArray(recipe.recipeImages)){
        return recipe.recipeImages.filter(Boolean);
    }

    return [];
}

/**
 * 現在選ばれている写真を表示する
 */
function renderCurrentImage(){
    if(recipeImages.length === 0){
        imageSectionElement.hidden =true;
        return;
    }

    imageSectionElement.hidden = false;

    recipeImageElement.src = 
        recipeImages[currentImageIndex];

    recipeImageElement.alt = 
        `${getDisplayText(selectedRecipe.title)}の写真` +
        `${currentImageIndex + 1}`;    
    
    imageCountElement.textContent = 
        `${currentImageIndex + 1} / ${recipeImages.length}`;

    const hasMultipleImages = 
        recipeImages.length > 1;
    
    if (previousImageButton) {
    previousImageButton.hidden =
        !hasMultipleImages;
    }

    if (nextImageButton) {
    nextImageButton.hidden =
        !hasMultipleImages;
    }
}

/**
 * 前の写真を表示する
 */
function showPreviousImage(){
    currentImageIndex--;

    if(currentImageIndex < 0){
        currentImageIndex = 
            recipeImages.length -1;
    }

    renderCurrentImage();
}

/**
 * 次の写真を表示する
 */
function showNextImage(){
    currentImageIndex++;

    if(
        currentImageIndex >=
        recipeImages.length
    ){
        currentImageIndex = 0;
    }

    renderCurrentImage();
}

/**
 * 材料名を取り出す
 *
 * 材料データが文字列でもオブジェクトでも
 * 表示できるようにしている。
 */
function getIngredientName(ingredient){
    if(typeof ingredien === "string"){
        return ingredient;
    }

    if(
        !ingredient ||
        typeof ingredient !== "object"
    ){
        return "";
    }

    return getDisplayText(
        ingredient.name ??
        ingredient.ingredient ??
        ingredient.getIngredientName ??
        ingredient.food
    );
}

/**
 * 材料の分量を取り出す
 */
function getIngredientAmount(ingredient){
    if(
        !ingredient ||
        typeof ingredient !== "object"
    ){
        return "";
    }

    return getDisplayText(
        ingredient.amount ??
        ingredient.quantity ??
        ingredient.ingredientAmounnt
    );
}

/**
 * 材料一覧を表示する
 */
function renderIngredients(){
    ingredientListElement.innerHTML = "";

    const ingredients = 
        Array.isArray(selectedRecipe.ingredients)
            ? selectedRecipe.ingredients
            : [];

    const validIngredients =
        ingredients.filter((ingredient) => {
            return (
                getIngredientName(ingredient) !== "" ||
                getIngredientAmount(ingredient) !== ""
            );
        });

    ingredientEmptyMessageElement.hidden =
        validIngredients.length > 0;

    if (validIngredients.length === 0) {
        return;
    }

    validIngredients.forEach((ingredient) => {
        const item =
            document.createElement("li");

        item.className = "ingredient-item";

        const name =
            document.createElement("span");

        name.className = "ingredient-name";
        name.textContent =
            getIngredientName(ingredient) ||
            "名称未設定";

        const amount =
            document.createElement("span");

        amount.className = "ingredient-amount";
        amount.textContent =
            getIngredientAmount(ingredient);

        item.appendChild(name);

        if (amount.textContent !== "") {
            item.appendChild(amount);
        }

        ingredientListElement.appendChild(item);
    });
}

function addIngredientsToShoppingList(){
    if(!selectedRecipe){
        return;
    }

    const ingredients = 
    Array.isArray(selectedRecipe.ingredients)
        ? selectedRecipe.ingredients
        : [];

    const validIngredients = ingredients.filter((ingredient) =>{
        return getIngredientName(ingredient) !=="";
    });

    if(validIngredients.length === 0){
        alert("買い物リストに追加できる材料がありません");
        return;
    }

    let shoppingList = 
        JSON.parse(localStorage.getItem("shoppingList")) || [];

    let addedCount = 0;

    validIngredients.forEach((ingredient) =>{

        const name = getIngredientName(ingredient);
        const amount = getIngredientAmount(ingredient);

        const displayName = 
            amount !== ""
                ? `${name} ${amount}`
                : name;

        const alreadyExists = shoppingList.some((item) =>{
            return item.name === displayName;
        });

        if(alreadyExists){
            return;
        }

        shoppingList.push({
            name: displayName,
            checked: false,
            sourceRecipe: getDisplayText(selectedRecipe.title) || "タイトル未設定"

        });

        addedCount++;
    });

    localStorage.setItem(
        "shoppingList",
        JSON.stringify(shoppingList)
    );

    if(addedCount === 0){
        alert("すべての材料がすでに買い物リストにはいってます");
    }else if(addedCount < validIngredients.length){
        alert(
            `${addedCount}件の材料を追加しました。\n` +
            "すでに登録されている材料は追加していません"
        );
    }else{
        alert("材料を買い物リストに追加しました");
    }
}

/**
 * 作り方の文章を取り出す
 */
function getStepText(step) {
    if (typeof step === "string") {
        return step.trim();
    }

    if (
        !step ||
        typeof step !== "object"
    ) {
        return "";
    }

    return getDisplayText(
        step.text ??
        step.description ??
        step.step ??
        step.content
    );
}

/**
 * 作り方を表示する
 */
function renderSteps() {
    stepListElement.innerHTML = "";

    const steps =
        Array.isArray(selectedRecipe.steps)
            ? selectedRecipe.steps
            : [];

    const validSteps =
        steps
            .map(getStepText)
            .filter((step) => step !== "");

    stepEmptyMessageElement.hidden =
        validSteps.length > 0;

    if (validSteps.length === 0) {
        return;
    }

    validSteps.forEach((stepText) => {
        const item =
            document.createElement("li");

        item.className = "step-item";
        item.textContent = stepText;

        stepListElement.appendChild(item);
    });
}

/**
 * レシピ全体を表示する
 */
function renderRecipe() {
    if (!selectedRecipe) {
        recipeDetailElement.hidden = true;
        notFoundMessageElement.hidden = false;
        return;
    }

    notFoundMessageElement.hidden = true;
    recipeDetailElement.hidden = false;

    recipeTitleElement.textContent =
        getDisplayText(selectedRecipe.title) ||
        "タイトル未設定";

    const tag =
        getDisplayText(selectedRecipe.tag) ||
        "タグなし";

    recipeTagElement.textContent = tag;

    recipeImages = getRecipeImages(selectedRecipe);
    console.log(
        "詳細画面の写真",
        recipeImages
    );
    currentImageIndex = 0;

    renderCurrentImage();
    renderIngredients();
    renderSteps();

    const backButton =
        document.querySelector(".back-button");

    const recipeId =
        selectedRecipe.id ??
        selectedRecipeIndex;

    const fromPage =
        getFromPage();

    if (fromPage === "photo") {
        backButton.href = "photo-list.html";
    } else {
        backButton.href = "recipe-list.html";
    }

    editButton.href =
        "recipe-edit.html?id=" +
        encodeURIComponent(recipeId) +
        "&from=" +
        encodeURIComponent(fromPage);
}

/**
 * 選択中のレシピを削除する
 */
function deleteSelectedRecipe() {
    if (!selectedRecipe) {
        return;
    }

    const recipeTitle =
        getDisplayText(selectedRecipe.title) ||
        "このレシピ";

    const shouldDelete = window.confirm(
        `「${recipeTitle}」を削除しますか？\n` +
        "削除したレシピは元に戻せません。"
    );

    if (!shouldDelete) {
        return;
    }

    recipes.splice(selectedRecipeIndex, 1);

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(recipes)
        );

        alert("レシピを削除しました");

        window.location.href =
            "recipe-list.html";
    } catch (error) {
        console.error(
            "レシピの削除に失敗しました。",
            error
        );

        alert(
            "レシピを削除できませんでした。"
        );
    }
}

/**
 * URLからfromを取得する関数を追加
 */
function getFromPage() {
    const parameters =
        new URLSearchParams(window.location.search);

    return parameters.get("from") ?? "list";
}

/**
 * 詳細画面を初期化する
 */
function initializeRecipeDetail() {
    recipes = loadRecipes();

    const recipeId =
        getRecipeIdFromUrl();

    const result =
        findSelectedRecipe(recipeId);

    selectedRecipe = result.recipe;
    selectedRecipeIndex = result.index;

    renderRecipe();

    if (previousImageButton) {
        previousImageButton.addEventListener(
            "click",
            showPreviousImage
        );
    }

    if (nextImageButton) {
        nextImageButton.addEventListener(
            "click",
            showNextImage
        );
    }

    if (deleteButton) {
        deleteButton.addEventListener(
            "click",
            deleteSelectedRecipe
        );
    }

    if(addToShoppingListButton){
        addToShoppingListButton.addEventListener(
            "click",
            addIngredientsToShoppingList
        );
    }
}

initializeRecipeDetail();


