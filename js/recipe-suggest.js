const backButton = 
    document.getElementById("backButton");

const suggestButton = 
    document.getElementById("suggestButton");

const suggestList = 
    document.getElementById("suggestList");

const emptyMessage = 
    document.getElementById("emptyMessage");

const SUGGEST_STATE_KEY = "recipeSuggestSearched";

if(backButton){
    backButton.addEventListener("click", () =>{
        window.location.href = "index.html";
    });
}

function getRecipes(){
    return JSON.parse(
        localStorage.getItem("recipes")
    ) || [];
}

function getStockList(){
    return JSON.parse(
        localStorage.getItem("stockList")
    ) || [];
}

function getIngredientName(ingredient){
    if(typeof ingredient === "string"){
        return ingredient.trim();
    }

    if(
        !ingredient ||
        typeof ingredient !== "object"
    ){
        return "";
    }

    return String(
        ingredient.name ??
        ingredient.ingredient ??
        ingredient.ingredientName ??
        ingredient.food ??
        ""
    ).trim();
}

function normalizeName(name){
    return name
        .replace(/\s+/g, "")
        .toLowerCase();
}

function findRecipeSuggestions(){
    const recipes = getRecipes();
    const stockList = getStockList();

    suggestList.innerHTML = "";

    if(recipes.length === 0){
        emptyMessage.style.display = "block";
        emptyMessage.textContent = 
            "登録されているレシピがありません";
        return;
    }

    if(recipes.length === 0){
        emptyMessage.style.display = "block";
        emptyMessage.textContent = 
            "在庫が登録されていません";
        return;
    }

    const stockNames = stockList.map((item) =>{
        return normalizeName(item.name);
    });

    const results = recipes.map((recipe, index) =>{
        const ingredients = 
            Array.isArray(recipe.ingredients)
                ? recipe.ingredients
                : [];

        const ingredientNames = 
            ingredients
                .map(getIngredientName)
                .filter((name) => name !== "");

        const matchedIngredients = 
            ingredientNames.filter((name) =>{
                
                const normalizedName = 
                    normalizeName(name);

                return stockNames.includes(
                    normalizedName
                );
            });

        const missingIngredients = 
            ingredientNames.filter((name) =>{

                const normalizedName = 
                    normalizeName(name);

                return !stockNames.includes(
                    normalizedName
                );
            });

        const total = 
            ingredientNames.length;

        const matched = 
            matchedIngredients.length;

        const percentage = 
            total === 0
                ? 0
                : Math.round(
                    matched / total * 100
                );

        return{
            recipe: recipe,
            index: index,
            total: total,
            matched: matched,
            percentage: percentage,
            missingIngredients: missingIngredients
        };
    });

    results.sort((a, b) =>{
        return b.percentage - a.percentage;
    });

    emptyMessage.style.display = "none";

    results.forEach((result) =>{
        const card = 
            document.createElement("div");

        card.classList.add("suggestCard");

        card.addEventListener("click", () => {

            console.log("カードがクリックされました");
            console.log(result);

            const recipeId =
                result.recipe.id ?? result.index;

            console.log("recipeId:", recipeId);

            window.location.href =
                "recipe-detail.html?id=" +
                encodeURIComponent(recipeId) +
                "&from=suggest";

        });

        

        const title = 
            document.createElement("h3");

        title.textContent = 
            result.recipe.title ||
            "タイトル未設定";

        const matchText = 
            document.createElement("p");

        matchText.textContent = 
            `${result.matched}/${result.total}材料あり (${result.percentage}%)`;

        card.appendChild(title);
        card.appendChild(matchText);

        if(
            result.missingIngredients.length > 0
        ){
            const missingText = 
                document.createElement("p");

            missingText.classList.add(
                "missingIngredients"
            );

            missingText.textContent = 
                "足りない材料：" +
                result.missingIngredients.join("、");

            card.appendChild(missingText);
        }else{
            const completeText = 
                document.createElement("p");

            completeText.classList.add(
                "completeRecipe"
            );

            completeText.textContent = 
                "✓ 在庫の材料だけで作れそうです";

            card.appendChild(completeText);
        }

        suggestList.appendChild(card);
    });

    sessionStorage.setItem(
        SUGGEST_STATE_KEY,
        "true"
    );
}

if(suggestButton){
    suggestButton.addEventListener(
        "click",
        findRecipeSuggestions
    );
}

const hasSearched = 
    sessionStorage.getItem(SUGGEST_STATE_KEY);

if(hasSearched === "true"){
    findRecipeSuggestions();
}