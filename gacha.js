// 図鑑データの定義（前回と同じものを利用）
const animals = {
    dog: [
        { name: "しばいぬ", image: "https://placehold.jp/150x100.png?text=柴犬" },
        { name: "ちわわ", image: "https://placehold.jp/150x100.png?text=チワワ" },
        { name: "ぽめらにあん", image: "https://placehold.jp/150x100.png?text=ポメラニアン" }
    ],
    cat: [
        { name: "みけねこ", image: "https://placehold.jp/150x100.png?text=三毛猫" },
        { name: "まんちかん", image: "https://placehold.jp/150x100.png?text=マンチカン" },
        { name: "さばとら", image: "https://placehold.jp/150x100.png?text=サバトラ" }
    ],
    bird: [
        { name: "すずめ", image: "https://placehold.jp/150x100.png?text=スズメ" },
        { name: "いんこ", image: "https://placehold.jp/150x100.png?text=インコ" },
        { name: "ふくろう", image: "https://placehold.jp/150x100.png?text=フクロウ" }
    ]
};

// 収集した動物のリスト（初期状態）
let collectedAnimals = JSON.parse(localStorage.getItem('collectedAnimals')) || [];
const gachaCost = 30;
let points = parseInt(localStorage.getItem('points')) || 100; // 初期ポイント設定

const pointsDisplay = document.getElementById('points-count');
const gachaButton = document.getElementById('gacha-button');
const resultText = document.getElementById('result-text');
const resultImage = document.getElementById('result-image');

// 全ての動物リストを平坦化して取得
function getAllAnimals() {
    return Object.values(animals).flat();
}

// まだ入手していない動物をランダムに選択
function getUncollectedAnimal() {
    const allAnimals = getAllAnimals();
    const uncollected = allAnimals.filter(animal => !collectedAnimals.includes(animal.name));
    if (uncollected.length === 0) {
        return null; // 未入手動物がいない
    }
    const randomIndex = Math.floor(Math.random() * uncollected.length);
    return uncollected[randomIndex];
}

// ガチャを引く関数
function drawGacha() {
    if (points < gachaCost) {
        resultText.textContent = "ポイントがたりないよ...！";
        resultImage.style.display = 'none';
        return;
    }

    const newAnimal = getUncollectedAnimal();

    if (!newAnimal) {
        resultText.textContent = "あたらしいどうぶつさんをまとう！";
        gachaButton.disabled = true;
        resultImage.style.display = 'none';
        return;
    }

    // ポイントを消費
    points -= gachaCost;
    pointsDisplay.textContent = points;
    localStorage.setItem('points', points);

    // 動物を入手済みリストに追加
    collectedAnimals.push(newAnimal.name);
    localStorage.setItem('collectedAnimals', JSON.stringify(collectedAnimals));

    // 結果表示
    resultText.textContent = `${newAnimal.name} をゲットしたよ！`;
    resultImage.src = newAnimal.image;
    resultImage.style.display = 'block';
}

// UIの初期状態を設定
function initializeUI() {
    pointsDisplay.textContent = points;
    if (getUncollectedAnimal() === null) {
        resultText.textContent = "あたらしいどうぶつさんをまとう！";
        gachaButton.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', initializeUI);

