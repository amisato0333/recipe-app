"use strict"

/*
 *レシピ保存時に使っているlocal Storageのキー名。
 *
 *保存機能で別の名前を使っている場合は、
 *この"recipes"　の部分だけ変更してください。
 */
const STORAGE_KEY = "recipes";

/*
 *詳細画面のファイル名。
 *詳細画面はあとで作る予定なので、
 *現時点ではクリックしてもページが存在しない可能性があります。
 */

const DETAIL_PAGE_URL = "recipe-detail.html"

const searchInput = document.getElementById("recipe-search");
const clearSearchButton = document.getElementById("clear-search-button");
const recipeListElement = document.getElementById("recipe-list");
const recipeCountElement = document.getElementById("recipe-count");
const emptyMessageElement = document.getElementById("empty-message");
const noResultMessageElemet = document.getElementById("no-result-message");

let recipes = [];

/**
 * localStorageからレシピを読み込む
 */
function loadRecipes(){
    try{
        const savedRecipes = localStorage.getItem(STORAGE_KEY);

        if(!savedRecipes){
            return[];
        }

        const parsedRecipes = JSON.parse(savedRecipes);

        if(!Array.isArray(parsedRecipes)){
            console.error(
                "保存されているレシピデータが配列ではありません。",
                parsedRecipes
            );
            return [];
        }
        return parsedRecipes;
    }catch(error){
        console.error(
            "レシピデータの読み込みに失敗しました。",
            error
        );
        return [];
    }
}

/**
 * 検索しやすい文字列に変換する
 *
 * ・前後の空白を削除
 * ・全角英数字を半角に近づける
 * ・英字を小文字にする
 * ・ひらがなをカタカナにそろえる
 */
function normalizeText(text){
    return String(text ?? "")
        .trim()
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[\u3041-\u3096]/g, (character) =>{
            return String.fromCharCode(
                character.charCodeAt(0) + 0x60
            );
        });
}

/**
 * タイトルを五十音のグループに分ける
 */
function getKanaGroup(title){
    const normalizeTitle = normalizeText(title);

    if(!normalizeTitle){
        return"その他";
    }
    const firstCharacter = normalizeTitle.charAt(0);

    const groups = [
        {
            label:"あ",
            characters:"アイウエオァィゥェォ"
        },
        {
            label:"か",
            characters:"カキクケコガギグゲゴ"
        },
        {
            label:"さ",
            characters:"サシスセソザジズゼゾ"
        },
        {
            label:"た",
            characters:"タチツテトダヂヅデドッ"
        },
        {
            label: "な",
            characters: "ナニヌネノ"
        },
        {
            label:"は",
            characters:"ハヒフヘホバビブベボパピプペポ"
        },
        {
            label:"ま",
            characters:"マミムメモ"
        },
        {
            label:"や",
            characters:"ヤユヨャュョ"
        },
        {
            label:"ら",
            characters:"ラリルレロ"
        },
        {
            label:"わ",
            characters:"ワヲンヮ"
        }
    ];

    const matchedGroup = groups.find((group) =>{
        return group.characters.includes(firstCharacter);
    });

    if(matchedGroup){
        return matchedGroup.label;
    }

    if(/^[a-z0-9]/i.test(firstCharacter)){
        return"英数字";
    }
    return"その他";
}

/**
 * レシピをタイトル順に並べる
 */
function sortRecipesByTitle(recipeArray){
    return[...recipeArray].sort((firstRecipe, seconsdRecipe) =>{
        const firstTitle = String(firstRecipe.title ?? "");
        const secondTitle = String(seconsdRecipe.title ?? "");

        return firstTitle.localeCompare(
            secondTitle,
            "ja",
            {
                sensitivity:"base",
                numeric:true
            }
        );
    });
}

/**
 * レシピを五十音グループごとにまとめる
 */
function groupRecipes(recipeArray){
    const groupRecipes = {};

    recipeArray.forEach((recipe) =>{
        const readingTitle = recipe.titleKana || recipe.title;

        const groupName = getKanaGroup(readingTitle);

        if(!groupRecipes[groupName]){
            groupRecipes[groupName] = [];
        }

        groupRecipes[groupName].push(recipe);
    });
    return groupRecipes;
}

/**
 * レシピの識別番号を取得する
 *
 * 保存データにidがあればidを使い、
 * なければ配列内の位置を使います。
 */
function getRecipeIdentifier(recipe, index){
    if(
        recipe.id !== undefined &&
        recipe.id !== null &&
        recipe.id !== ""
    ){
        return String(recipe.id);
    }
    return String(index);
}

/**
 * レシピ1件分のHTMLを作る
 */
function createRecipeItem(recipe, originalIndex) {
    const listItem = document.createElement("li");
    listItem.className = "recipe-item";

    const link = document.createElement("a");
    link.className = "recipe-link";

    const recipeIdentifier = getRecipeIdentifier(
        recipe,
        originalIndex
    );

    link.href =
        `${DETAIL_PAGE_URL}?id=` +
        encodeURIComponent(recipeIdentifier) +
        "&from=list";

    const title = document.createElement("span");
    title.className = "recipe-title";
    title.textContent =
        String(recipe.title ?? "").trim() ||
        "タイトル未設定";

    const arrow = document.createElement("span");
    arrow.className = "recipe-arrow";
    arrow.textContent = "›";
    arrow.setAttribute("aria-hidden", "true");

    link.appendChild(title);
    link.appendChild(arrow);
    listItem.appendChild(link);

    return listItem;
}

/**
 * 一覧画面を表示する
 */
function renderRecipes(recipeArray, isSearching = false){
    recipeListElement.innerHTML = "";

    const hasSavedRecipes = recipes.length > 0;
    const hasDisplayedRecipes = recipeArray.length > 0;

    emptyMessageElement.hidden = hasSavedRecipes;
    noResultMessageElemet.hidden = 
        !hasSavedRecipes ||
        hasDisplayedRecipes ||
        !isSearching;

    if(!hasSavedRecipes){
        recipeCountElement.textContent = "";
        return;
    }

    if(!hasDisplayedRecipes){
        recipeCountElement.textContent = "0件";
        return;
    }

    recipeCountElement.textContent = 
    `${recipeArray.length}件のレシピ`;

    const sortedRecipes = sortRecipesByTitle(recipeArray);
    const groupedRecipes = groupRecipes(sortedRecipes);

    const groupOrder = [
        "あ",
        "か",
        "さ",
        "た",
        "な",
        "は",
        "ま",
        "や",
        "ら",
        "わ",
        "英数字",
        "その他"
    ];

    groupOrder.forEach((groupName) => {
        const recipesInGroup = groupedRecipes[groupName];

        if (!recipesInGroup?.length) {
            return;
        }

        const section = document.createElement("section");
        section.className = "recipe-group";

        const heading = document.createElement("h2");
        heading.className = "recipe-group-title";
        heading.textContent = groupName;

        const list = document.createElement("ul");
        list.className = "recipe-group-list";

        recipesInGroup.forEach((recipe) => {
            const originalIndex = recipes.indexOf(recipe);

            const recipeItem = createRecipeItem(
                recipe,
                originalIndex
            );

            list.appendChild(recipeItem);
        });

        section.appendChild(heading);
        section.appendChild(list);

        recipeListElement.appendChild(section);
    });
}
/**
 * 入力された文字で検索する
 */
function searchRecipes() {
    const keyword = normalizeText(searchInput.value);
    const isSearching = keyword.length > 0;

    clearSearchButton.classList.toggle(
        "is-visible",
        isSearching
    );

    if (!isSearching) {
        renderRecipes(recipes, false);
        return;
    }

    const filteredRecipes = recipes.filter((recipe) => {
        const recipeTitle = normalizeText(recipe.title);

        return recipeTitle.includes(keyword);
    });

    renderRecipes(filteredRecipes, true);
}

/**
 * ページを初期化する
 */
function initializeRecipeList() {
    recipes = loadRecipes();

    renderRecipes(recipes);

    searchInput.addEventListener("input", searchRecipes);

    clearSearchButton.addEventListener("click", () => {
        searchInput.value = "";
        searchInput.focus();

        searchRecipes();
    });
}

initializeRecipeList();