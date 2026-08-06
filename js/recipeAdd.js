console.log("レシピ追加画面");

/**
 * 選択した画面を縮小・圧縮してBase64に変換する
 */
function compressImage(
    file,
    maxSize = 1200,
    quantity = 0.75
){
    return new Promise((resolve, reject) =>{
        if(!file.type.startsWith("image/")){
            reject(new Error("画像ファイルではありません"));
            return;
        }

        const render = new FileReader();

        render.onload = () =>{
            const image = new Image();

            image.onload = () =>{
                let width = image.naturalWidth;
                let height = image.naturalHeight;

                if(width > height && width > maxSize){
                    height = Math.round(
                        height * (maxSize / width)
                    );
                    width = maxSize;
                }else if(
                    height >= width &&
                    height > maxSize
                ){
                    width = Math.round(
                        width * (maxSize / height)
                    );
                    height = maxSize;
                }

                const canvas = 
                    document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const context = 
                    canvas.getContext("2d");

                if(!context){
                    reject(
                        new Error(
                            "画像を処理できませんでした"
                        )
                    );
                    return;
                }
                /**
                 * JPEGの透明部分が黒くならないよう、
                 * 背景を白くしてから画像を描く
                 */
                context.fillStyle = "#ffffff";
                context.fillRect(
                    0,
                    0,
                    width,
                    height
                );

                context.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );
                const compressedDaraUrl = 
                    canvas.toDataURL(
                        "image/jpeg",
                        quantity
                    );
                resolve(compressedDaraUrl);
            };
            image.onerror = () =>{
                reject(
                    new Error(
                        "画像を読み込めませんでした"
                    )
                );
            };
            image.src = render.result;
        };
        render.onerror = () =>{
            reject(
                new Error(
                    "ファイルを読み込めませんでした"
                )
            );
        };
        render.readAsDataURL(file);
    });
}

//写真プレビュー 最大３枚
const recipeImage = document.getElementById("recipeImage");
const imagePreviewArea = document.getElementById("imagePreviewArea");

let recipeImages = [];
let currentImageIndex = 0;

// 写真を選択したとき
recipeImage.addEventListener("change", async () => {
    const files = Array.from(recipeImage.files);

    const remainingCount =
        3 - recipeImages.length;

    if (remainingCount <= 0) {
        alert("写真は最大3枚までです");
        recipeImage.value = "";
        return;
    }

    const filesToAdd =
        files.slice(0, remainingCount);

    if (files.length > remainingCount) {
        alert(
            `追加できる写真はあと${remainingCount}枚です`
        );
    }

    try {
        for (const file of filesToAdd) {
            const compressedImage =
                await compressImage(
                    file,
                    1200,
                    0.75
                );

            recipeImages.push(compressedImage);
            currentImageIndex =
                recipeImages.length - 1;
        }

        showImagePreview();
    } catch (error) {
        console.error(
            "画像の圧縮に失敗しました。",
            error
        );

        alert(
            "画像を読み込めませんでした。別の画像を試してください。"
        );
    } finally {
        recipeImage.value = "";
    }
});

// 写真を画面に表示する
function showImagePreview() {
    imagePreviewArea.innerHTML = "";

    if (recipeImages.length === 0) {
        currentImageIndex = 0;
        return;
    }

    if (currentImageIndex < 0) {
        currentImageIndex = recipeImages.length - 1;
    }

    if (currentImageIndex >= recipeImages.length) {
        currentImageIndex = 0;
    }

    const carousel = document.createElement("div");
    carousel.className = "imageCarousel";

    const showNavigation = recipeImages.length >= 2;

    carousel.innerHTML = `
        <img
            src="${recipeImages[currentImageIndex]}"
            alt="料理写真"
        >

        ${
            showNavigation
                ? `
                    <button
                        type="button"
                        class="imageNavButton imagePrevButton"
                        aria-label="前の写真"
                    >
                        ‹
                    </button>

                    <button
                        type="button"
                        class="imageNavButton imageNextButton"
                        aria-label="次の写真"
                    >
                        ›
                    </button>
                `
                : ""
        }

        <button
            type="button"
            class="imageDeleteButton"
            aria-label="写真を削除"
        >
            ×
        </button>

        <div class="imageCount">
            ${currentImageIndex + 1} / ${recipeImages.length}
        </div>
    `;

    imagePreviewArea.appendChild(carousel);
}

// 写真部分のボタン操作
imagePreviewArea.addEventListener("click", (event) => {
    const prevButton = event.target.closest(".imagePrevButton");
    const nextButton = event.target.closest(".imageNextButton");
    const deleteButton = event.target.closest(".imageDeleteButton");

    if (prevButton) {
        currentImageIndex -= 1;
        showImagePreview();
        return;
    }

    if (nextButton) {
        currentImageIndex += 1;
        showImagePreview();
        return;
    }

    if (deleteButton) {
        recipeImages.splice(currentImageIndex, 1);

        if (currentImageIndex >= recipeImages.length) {
            currentImageIndex = recipeImages.length - 1;
        }

        showImagePreview();
    }
});


//材料エリア
const ingredientsArea =document.getElementById("ingredientsArea");
const addIngredientButton = document.getElementById("addIngredientButton");

//作り方エリア
const stepsArea = document.getElementById("stepsArea");
const addStepButton = document.getElementById("addStepButton");

//材料を追加
addIngredientButton.addEventListener("click", () =>{
    const ingredientRow = document.createElement("div");
    ingredientRow.className = "ingredientRow"

    ingredientRow.innerHTML = `
    <input type="text" class="ingredientName" placeholder="材料名">
    <input type="text" class="ingredientAmount" placehplder="分量">
    <button type="button" class="deleteButton">×</button>
    `;

    ingredientsArea.appendChild(ingredientRow);
});

//手順を追加
addStepButton.addEventListener("click", () =>{
    const stepRow = document.createElement("div");
    stepRow.className = "stepRow";

    stepRow.innerHTML = `
    <textarea class="stepInput" placeholder="手順を入力"></textarea>;
    <button type="button" class="deleteButton">×</button>
    `;

    stepsArea.appendChild(stepRow);
});

document.addEventListener("click", (event) =>{
    if(event.target.classList.contains("deleteButton")){
        event.target.parentElement.remove();
    }
});

// =========================
// レシピ保存
// =========================

const saveRecipeButton = document.getElementById("saveRecipeButton");
const recipeTitleInput = document.getElementById("recipeTitle");
const recipeTitleKanaInput = document.getElementById("recipeTitleKana");

saveRecipeButton.addEventListener("click", () =>{
    //料理名
    const title = recipeTitleInput.value.trim();
    const titleKana = recipeTitleKanaInput.value.trim();    

    if(title === ""){
        alert("料理名を入力してください")
        recipeTitleInput.focus();
        return;
    }

    //材料
    const ingredientRows = document.querySelectorAll(".ingredientRow");
    const ingredients = [];

    ingredientRows.forEach((row) => {
        const nameInput =
            row.querySelector(".ingredientName");

        const amountInput =
            row.querySelector(".ingredientAmount");

        //必要な入力欄が見つからない行は飛ばす
        if(!nameInput || !amountInput){
            console.warn("材料蘭が見つかりませんでした", row);
            return;
        }

        const name = nameInput ? nameInput.value.trim() : "";

        const amount = amountInput ? amountInput.value.trim() : "";

        //材料名か分量のどちらかが入力されていれば保存
        if(name !=="" || amount !==""){
            ingredients.push({
                name: name,
                amount: amount
            });
        }
    });

    //作り方
    const stepInputs = document.querySelectorAll(".stepInput");
    const steps = [];

    stepInputs.forEach((input) => {
        const step = input.value.trim();

        if(step != ""){
            steps.push(step);
        }
    });

    //選択されているタグ
    const selectedTag = document.querySelector(
        'input[name="tag"]:checked'
    );

    const tag = selectedTag ? selectedTag.value: "なし";

    //レシピ1件分のデータ
    const newRecipe = {
        id: Date.now(),
        title: title,
        titleKana: titleKana,
        images: recipeImages,
        ingredients: ingredients,
        steps: steps,
        tag: tag,
        createdAt: new Date().toISOString()
    };

    console.log("保存直前の写真配列", recipeImages);
    console.log("保存するレシピ", newRecipe);
    console.log("保存する写真枚数", newRecipe.images.length);

    //すでに保存されているレシピを取得
    const saveRecipes = 
        JSON.parse(localStorage.getItem("recipes")) || [];
    
    //新しいレシピを追加
    saveRecipes.push(newRecipe);

    //localStorageに保存
    try{
        localStorage.setItem(
            "recipes",
            JSON.stringify(saveRecipes)
        );

        console.log(
        "保存後のrecipes",
        JSON.parse(localStorage.getItem("recipes"))
        );
        
        alert("レシピを保存しました");

        //保存後にホームへ戻る
        location.href = "index.html";
    
    }catch(error){
        console.error(error);

        alert(
            "保存容量を超えた可能性があります。写真を減らすか、小さい画像を使ってください。"
        );
        
    }
});