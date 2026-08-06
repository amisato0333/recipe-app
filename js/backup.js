const backButton = document.getElementById("backButton");
const exportButton = document.getElementById("exportButton");
const restoreFileInput = document.getElementById("restoreFileInput");
const selectFileButton = document.getElementById("selectFileButton");
const selectedFileName = document.getElementById("selectedFileName");
const restoreButton = document.getElementById("restoreButton");
const messageText = document.getElementById("messageText");

let selectedBackupData = null;

/* =========================
   ホーム画面へ戻る
========================= */
backButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

/* =========================
   日時をファイル名用に整える
========================= */
function createBackupFileName() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");

    return `recipe-backup-${year}-${month}-${day}-${hour}${minute}.json`;
}

/* =========================
   バックアップを書き出す
========================= */
exportButton.addEventListener("click", () => {
    try {
        const backupData = {
            version: 1,
            backupDate: new Date().toISOString(),

            recipes:
                JSON.parse(localStorage.getItem("recipes")) || [],

            mealPlans:
                JSON.parse(localStorage.getItem("mealPlans")) || []
        };

        const json = JSON.stringify(backupData, null, 2);

        const blob = new Blob([json], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = createBackupFileName();

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        showMessage(
            "バックアップを保存しました。",
            "success"
        );
    } catch (error) {
        console.error(error);

        showMessage(
            "バックアップの作成に失敗しました。",
            "error"
        );
    }
});

/* =========================
   ファイル選択画面を開く
========================= */
selectFileButton.addEventListener("click", () => {
    restoreFileInput.click();
});

/* =========================
   選択したJSONを読み込む
========================= */
restoreFileInput.addEventListener("change", () => {
    const file = restoreFileInput.files[0];

    selectedBackupData = null;
    restoreButton.disabled = true;

    if (!file) {
        selectedFileName.textContent =
            "ファイルは選択されていません";

        return;
    }

    selectedFileName.textContent = file.name;

    const reader = new FileReader();

    reader.addEventListener("load", () => {
        try {
            const data = JSON.parse(reader.result);

            if (!isValidBackupData(data)) {
                throw new Error(
                    "バックアップの形式が正しくありません"
                );
            }

            selectedBackupData = data;
            restoreButton.disabled = false;

            showMessage(
                "バックアップファイルを読み込みました。",
                "success"
            );
        } catch (error) {
            console.error(error);

            selectedBackupData = null;
            restoreButton.disabled = true;

            showMessage(
                "このファイルは復元に使用できません。",
                "error"
            );
        }
    });

    reader.addEventListener("error", () => {
        selectedBackupData = null;
        restoreButton.disabled = true;

        showMessage(
            "ファイルの読み込みに失敗しました。",
            "error"
        );
    });

    reader.readAsText(file);
});

/* =========================
   バックアップ形式を確認
========================= */
function isValidBackupData(data) {
    if (!data || typeof data !== "object") {
        return false;
    }

    if (!Array.isArray(data.recipes)) {
        return false;
    }

    if (
        data.mealPlans !== undefined &&
        !Array.isArray(data.mealPlans)
    ) {
        return false;
    }

    return true;
}

/* =========================
   データを復元
========================= */
restoreButton.addEventListener("click", () => {
    if (!selectedBackupData) {
        showMessage(
            "復元するファイルを選択してください。",
            "error"
        );

        return;
    }

    const shouldRestore = window.confirm(
        "現在保存されているレシピと献立は、" +
        "バックアップの内容に置き換えられます。\n\n" +
        "本当に復元しますか？"
    );

    if (!shouldRestore) {
        return;
    }

    try {
        const recipes = selectedBackupData.recipes || [];
        const mealPlans = selectedBackupData.mealPlans || [];

        localStorage.setItem(
            "recipes",
            JSON.stringify(recipes)
        );

        localStorage.setItem(
            "mealPlans",
            JSON.stringify(mealPlans)
        );

        showMessage(
            "復元が完了しました。",
            "success"
        );

        window.alert(
            "バックアップの復元が完了しました。"
        );

        window.location.href = "index.html";
    } catch (error) {
        console.error(error);

        showMessage(
            "復元に失敗しました。",
            "error"
        );
    }
});

/* =========================
   画面メッセージ
========================= */
function showMessage(text, type) {
    messageText.textContent = text;

    messageText.classList.remove(
        "successMessage",
        "errorMessage"
    );

    if (type === "success") {
        messageText.classList.add("successMessage");
    }

    if (type === "error") {
        messageText.classList.add("errorMessage");
    }
}