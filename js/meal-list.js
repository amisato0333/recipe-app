const backButton = document.getElementById("backButton");
const mealDate = document.getElementById("mealDate");
const prevDateButton = document.getElementById("prevDateButton");
const nextDateButton = document.getElementById("nextDateButton");
const addMealButton = document.getElementById("addMealButton");
const mealListContainer = document.getElementById("mealListContainer");
const todayLabel = document.getElementById("todayLabel");

/* =========================
   食事区分
========================= */
const mealTypes = [
    {
        value: "朝食",
        icon: "breakfast_dining"
    },
    {
        value: "昼食",
        icon: "lunch_dining"
    },
    {
        value: "夕食",
        icon: "dinner_dining"
    },
    {
        value: "間食",
        icon: "cookie"
    },
    {
        value: "その他",
        icon: "restaurant"
    }
];

/* =========================
   ホームへ戻る
========================= */
backButton.addEventListener("click", () =>{
    window.location.href = "index.html";
});

/* =========================
   日付を YYYY-MM-DD にする
========================= */
function formatDate(date){
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
   URLの日付を取得
========================= */
function getInitialDate(){
    const params = new URLSearchParams(
        window.location.search
    );

    const dateFromUrl = params.get("date");

    if(
        dateFromUrl &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl)
    ){
        return dateFromUrl;
    }

    return formatDate(new Date());
}

function updateTodayLabel() {
    const today = new Date();

    const todayText = formatDate(today);
    const selectedDate = mealDate.value;

    console.log("今日の日付:", todayText);
    console.log("選択中の日付:", selectedDate);

    if (selectedDate === todayText) {
        todayLabel.textContent = "今日";
    } else {
        todayLabel.textContent = "";
    }
}

/* =========================
   日付を変更する
========================= */
function changeDate(dayDifference){
    const currentDate = new Date(
        `${mealDate.value}T00:00:00`
    );

    currentDate.setDate(
        currentDate.getDate() + dayDifference
    );

    mealDate.value = formatDate(currentDate);

    updateUrlDate();
    updateTodayLabel();
    displayMeals();
}

/* =========================
   URLの日付も変更する
========================= */
function updateUrlDate(){
    const url = new URL(window.location.href);

    url.searchParams.set(
        "date",
        mealDate.value
    );

    window.history.replaceState(
        {},
        "",
        url
    );
}

/* =========================
   保存済み献立を取得
========================= */
function getMealPlans(){
    try{
        const savedMealPlans = 
            localStorage.getItem("mealPlans");

        return savedMealPlans
            ? JSON.parse(savedMealPlans)
            : [];
    } catch(error){
        console.error(
            "献立データの読み込みに失敗しました",
            error
        );

        return [];
    }
}

/* =========================
   指定日の献立を表示
========================= */
function displayMeals() {
    const selectedDate = mealDate.value;
    const mealPlans = getMealPlans();

    mealListContainer.innerHTML = "";

    mealTypes.forEach((mealType) => {
        const meals = mealPlans.filter((meal) => {
            return (
                meal.date === selectedDate &&
                meal.mealType === mealType.value
            );
        });

        const mealCard =
            document.createElement("section");

        mealCard.className = "mealCard";

        const mealHeader =
            document.createElement("div");

        mealHeader.className = "mealCardHeader";

        const titleArea =
            document.createElement("div");

        titleArea.className = "mealTitleArea";

        const icon =
            document.createElement("span");

        icon.className =
            "material-symbols-outlined mealIcon";

        icon.textContent = mealType.icon;

        const title =
            document.createElement("h2");

        title.textContent = mealType.value;

        titleArea.appendChild(icon);
        titleArea.appendChild(title);

        mealHeader.appendChild(titleArea);
        mealCard.appendChild(mealHeader);

        if (meals.length === 0) {
            const emptyText =
                document.createElement("p");

            emptyText.className = "emptyMealText";
            emptyText.textContent =
                "登録されていません";

            mealCard.appendChild(emptyText);

            //空のカードを押したら献立追加画面へ移動
            mealCard.classList.add("emptyMealCard");

            mealCard.addEventListener("click", () =>{
                const date = encodeURIComponent(mealDate.value);
                const mealTypeValue = 
                    encodeURIComponent(mealType.value);

                window.location.href = 
                    `meal-edit.html?date=${date}&mealType=${mealTypeValue}`;
            });
        } else {
            meals.forEach((meal) => {
                const mealContent =
                    createMealContent(meal);

                mealCard.appendChild(mealContent);
            });
        }

        mealListContainer.appendChild(mealCard);
    });
}

/* =========================
   献立1件分を作る
========================= */
function createMealContent(meal) {
    const mealContent =
        document.createElement("div");

    mealContent.className = "mealContent";

    if (meal.time) {
        const timeText =
            document.createElement("p");

        timeText.className = "mealTime";

        timeText.innerHTML = `
            <span class="material-symbols-outlined">
                schedule
            </span>
            ${escapeHtml(meal.time)}
        `;

        mealContent.appendChild(timeText);
    }

    const foodList =
        document.createElement("ul");

    foodList.className = "foodList";

    const foods = Array.isArray(meal.foods)
        ? meal.foods
        : [];

    if (foods.length === 0) {
        const emptyFood =
            document.createElement("li");

        emptyFood.textContent =
            "料理が登録されていません";

        foodList.appendChild(emptyFood);
    } else {
        foods.forEach((food) => {
            const foodItem =
                document.createElement("li");

            foodItem.className = "foodItem";

            const foodName =
                document.createElement("span");

            foodName.textContent =
                food.title || "名称なし";

            foodItem.appendChild(foodName);

            if (food.type === "recipe") {
                const recipeLabel =
                    document.createElement("span");

                recipeLabel.className =
                    "recipeLabel";

                recipeLabel.textContent =
                    "登録レシピ";

                foodItem.appendChild(recipeLabel);
            }

            foodList.appendChild(foodItem);
        });
    }

    mealContent.appendChild(foodList);

    const buttonArea =
        document.createElement("div");

    buttonArea.className = "mealButtonArea";

    const editButton =
        document.createElement("button");

    editButton.className = "editMealButton";
    editButton.type = "button";

    editButton.innerHTML = `
        <span class="material-symbols-outlined">
            edit
        </span>
        編集
    `;

    editButton.addEventListener("click", () => {
        window.location.href =
            `meal-edit.html?id=${encodeURIComponent(meal.id)}`;
    });

    const deleteButton =
        document.createElement("button");

    deleteButton.className = "deleteMealButton";
    deleteButton.type = "button";

    deleteButton.innerHTML = `
        <span class="material-symbols-outlined">
            delete
        </span>
        削除
    `;

    deleteButton.addEventListener("click", () => {
        deleteMeal(meal.id);
    });

    buttonArea.appendChild(editButton);
    buttonArea.appendChild(deleteButton);

    mealContent.appendChild(buttonArea);

    return mealContent;
}

/* =========================
   献立を削除
========================= */

function deleteMeal(mealId) {
    const shouldDelete = window.confirm(
        "この献立を削除しますか？"
    );

    if (!shouldDelete) {
        return;
    }

    const mealPlans = getMealPlans();

    const updatedMealPlans =
        mealPlans.filter((meal) => {
            return String(meal.id) !== String(mealId);
        });

    localStorage.setItem(
        "mealPlans",
        JSON.stringify(updatedMealPlans)
    );

    displayMeals();
}

/* =========================
   HTMLとして危険な文字を変換
========================= */

function escapeHtml(value) {
    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}

/* =========================
   ボタン・日付の操作
========================= */

prevDateButton.addEventListener("click", () => {
    changeDate(-1);
});

nextDateButton.addEventListener("click", () => {
    changeDate(1);
});

mealDate.addEventListener("change", () => {
    if (!mealDate.value) {
        mealDate.value = formatDate(new Date());
    }

    updateUrlDate();
    updateTodayLabel();
    displayMeals();
});

addMealButton.addEventListener("click", () => {
    const selectedDate = mealDate.value;

    window.location.href =
        `meal-edit.html?date=${encodeURIComponent(selectedDate)}`;
});

/* =========================
   初期表示
========================= */

mealDate.value = getInitialDate();

updateUrlDate();
updateTodayLabel();
displayMeals();