"use strict";

const STORAGE_KEY = "recipes";

const searchInput = 
    document.getElementById("photo-search");

const clearSearchButton = 
    document.getElementById("clear-search-button");

const photoCountElement = 
    document.getElementById("photo-count");

const photoGridElement = 
    document.getElementById("photo-grid");

const emptyMessageElement = 
    document.getElementById("empty-message");

const noResultMessageElement = 
    document.getElementById("no-result-message");

let recipes = [];
let photoItems = [];

/**
 * LocalStorageからレシピを取得する
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

        return Array.isArray(parsedRecipes)
            ? parsedRecipes
            : [];
    }catch(error){
        console.error(
            "レシピの読み込みに失敗しました",
            error
        );

        return [];
    }
}

/**
 * 値を安全な文字列にする
 */
function getText(value){
    if(
        value === undefined ||
        value === null
    ){
        return "";
    }

    return String(value).trim();
}

/**
 * 検索用の文字列に変換する
 */
function normalizeText(value){
    return getText(value)
        .normalize("NFKC")
        .toLowerCase()
        .replace(
            /[\u3041-\u3096]/g,
            (character) =>{
                return String.fromCharCode(
                    character.charCodeAt(0) + 
                    0x60
                );
            }
        );
}

/**
 * レシピの写真配列を取得する
 */
function getRecipeImages(recipe){
    if(Array.isArray(recipe.images)){
        return recipe.images.filter(Boolean);
    }

    if(
        Array.isArray(
            recipe.recipeImages
        )
    ){
        return recipe.recipeImages.filter(
            Boolean
        );
    }
    return [];
}

/**
 * レシピと写真を1枚ずつデータに分解する
 */
function createPhotoItems(recipeArray){
    const items = [];

    recipeArray.forEach(
        (recipe, recipeIndex) =>{
            const images = 
                getRecipeImages(recipe);
            
            const recipeId = 
            recipe.id ??
            recipeIndex;

            images.forEach(
                (image, imageIndex) =>{
                    items.push({
                        recipeId,
                        recipeIndex,
                        title:
                            getText(
                                recipe.title
                            ) ||
                            "タイトル未設定",

                        titleKana:
                            getText(
                                recipe.titleKana
                            ),

                        tag:
                            getText(recipe.tag) ||
                            "なし",

                        image,
                        imageIndex,
                        imageCount:
                            images.length,

                        createdAt:
                            recipe.createdAt ??
                            ""
                    });
                }
            );
        }
    );
    return items;
}

/**
 * 写真カードを作る
 */
function createPhotoCard(photoItem){
    const card = 
        document.createElement("article");

    card.className = "photo-card";

    const link = 
        document.createElement("a");

    link.className = "photo-link";

    link.href = 
        "recipe-detail.html?id=" +
        encodeURIComponent(photoItem.recipeId) +
        "&from=photo";

    const imageWrapper = 
        document.createElement("div");

    imageWrapper.className = 
        "photo-image-wrapper";

    const image = 
        document.createElement("img");

    image.className = "photo-image";
    image.src = photoItem.image;

    image.alt = 
        `${photoItem.title}の写真` +
        `${photoItem.imageIndex + 1}`;

    image.loading = "lazy";

    image.addEventListener(
        "error",
        () =>{
            card.remove();
        }
    );

    imageWrapper.appendChild(image);

    if(photoItem.imageCount > 1){
        const photoNumber = 
            document.createElement("span");

        photoNumber.className = 
            "photo-number";

        photoNumber.textContent = 
            `${photoItem.imageIndex + 1}` +
            ` / ${photoItem.imageCount}`;

        imageWrapper.appendChild(
            photoNumber
        );
    }

    const information = 
        document.createElement("div");

    information.className = 
        "photo-infomation";

    const title = 
        document.createElement("p");

    title.className = "photo-title";
    title.textContent = photoItem.title;

    const tag = document.createElement("span");

    tag.className = "photo-tag";
    tag.textContent = photoItem.tag;

    information.appendChild(title);

    if(photoItem.tag !== "なし"){
        information.appendChild(tag);
    }

    link.appendChild(imageWrapper);
    link.appendChild(information);

    card.appendChild(link);

    return card;
}

/**
 * 写真一覧を表示する
 */
function renderPhotos(
    displayedItems,
    isSearching = false
){
    photoGridElement.innerHTML = "";

    const hasAllPhotos = 
        photoItems.length > 0;

    const hasDisplayedPhotos = 
        displayedItems.length > 0;

    emptyMessageElement.hidden = 
        hasAllPhotos;

    noResultMessageElement.hidden = 
        !hasAllPhotos ||
        hasDisplayedPhotos ||
        !isSearching;

    if(!hasAllPhotos){
        photoCountElement.textContent = "";
        return;
    }

    displayedItems.forEach(
        (photoItem) =>{
            photoGridElement.appendChild(
                createPhotoCard(photoItem)
            );
        }
    );
}

/**
 * 料理名で検索する
 */
function searchPhotos(){
    const keyword = 
        normalizeText(searchInput.value);

    const isSearching = 
        keyword.length > 0;

    clearSearchButton.classList.toggle(
        "is-visible",
        isSearching
    );

    if(!isSearching){
        renderPhotos(photoItems, false);
        return;
    }

    const filteredItems = 
        photoItems.filter((photoItem) =>{
            const title = 
                normalizeText(
                    photoItem.title
                );

            const titleKana = 
                normalizeText(
                    photoItem.titleKana
                );

            return(
                title.includes(keyword) ||
                titleKana.includes(keyword)
            );
        });

    renderPhotos(
        filteredItems,
        true
    );
}

/**
 * 写真一覧画面を初期化する
 */
function initializePhotoList(){
    recipes = loadRecipes();

    photoItems = createPhotoItems(recipes);

    /**
     * 新しく追加された写真を先に表示する
     */
    photoItems.reverse();

    renderPhotos(photoItems);

    searchInput.addEventListener(
        "input",
        searchPhotos
    );

    clearSearchButton.addEventListener(
        "click",
        () =>{
            searchInput.value = "";
            searchInput.focus();

            searchPhotos();
        }
    );
}

initializePhotoList()
