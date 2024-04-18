export function show(status) {
    var allRows = document.querySelectorAll('.game-row');
    var gamesContainer = document.querySelector('#games-list tbody');
    
    // Check if gamesContainer is null before proceeding
    if (!gamesContainer) {
        console.error("Element with ID 'games-list' not found");
        return;
    }
    
    var firstGameRow = gamesContainer.querySelector('.game-row');

    var matchingRows = [];
    allRows.forEach(function (row) {
        if (row.dataset.status === status || status === 'all') {
            matchingRows.push(row);
        } else {
            row.classList.add('hidden');
        }
    });

    matchingRows.forEach(function (row) {
        row.classList.remove('hidden');
    });
    //updateGameNumbers();
}