import $ from "jquery"

let products = [];

let filter = {
    options: {},
    activeOptions: {},
};
// filter.brands = new Set();
// filter.categories = new Set();

// Создаем массив товаров 
$("table tr:has('.table-advance')").each(function (index) {
    let product = {};
    product.filterOptions = {};

    product.id = $(this).attr("data-id")

    // Категория товара
    let categorie = $(this).prev(".table-title").text().trim();
    categorie === "" ? categorie = $(this).find(".table-main-info .table-item:first-of-type").text().trim() : false;
    product.filterOptions["Категория"] = categorie

    // Остальные опции товара
    let options = $(this).attr('data-options');
    options = JSON.parse(options)
    product.filterOptions = { ...product.filterOptions, ...options }


    // Заполняем фильтр
    for (let option in product.filterOptions) {
        option = option.trim()

        if (option in filter.options) {
            filter.options[option].add(product.filterOptions[option].trim())
        } else {
            filter.options[option] = new Set()
            filter.options[option].add(product.filterOptions[option].trim())
        }
    }

    products.push(product);
});


function createOptions(arr, name = "Нет заголовка") {
    let template = `<div class="filter__item" data-filter="${name}">`

    template += `<span class="filter__title">${name}</span><div class="filter__checkbox-list">`

    arr.forEach(val => {
        template += `<label class="filter__checkbox"> 
                        <input value="${val}" type="checkbox">
                        <span class="filter__checkbox-box"></span>
                        <span class="filter__checkbox-name">${val} </span>
                        <span class="filter__counter"></span>
                    </label>`
    })

    template += "</div></div>"

    return template
}

// Динамическая генерация фильтра
for (let option in filter.options) {
    $(".filter").append(createOptions(filter.options[option], option))
}


// -------Блок фильтра---------

// Развернуть/свернуть опции фильтра
function showFilterOption(e) {
    const item = $(e.target).closest(".filter__item")
    const list = item.find(".filter__checkbox-list")

    item.toggleClass("hide")
    list.slideToggle(200)
}
$(".filter").on("click", ".filter__title", showFilterOption)

// Развернуть/свернуть фильтр
function showMobFilter(e) {
    $(".filter").slideToggle(200)
}
$(".filter-trigger").on("click", showMobFilter)

// Фильтрация товаров
function filterProducts() {
    $("tr[data-options]").show()

    filter.activeOptions = []

    $(".filter input:checked").each(function (index, input) {
        let val = $(input).attr("value")
        let key = $(input.closest(".filter__item")).attr("data-filter")

        if (key in filter.activeOptions) {
            filter.activeOptions[key].push(val)
        } else {
            filter.activeOptions[key] = new Array()
            filter.activeOptions[key].push(val)
        }
    })


    let filteredList = []

    for (let option in filter.activeOptions) {
        products.forEach(product => {
            let optionName = product.filterOptions[option]

            optionName ? optionName = optionName.trim() : false;

            if (filter.activeOptions[option].indexOf(optionName) === -1) {
                filteredList.push(product)
            }
        })
    }

    filteredList.forEach(product => {
        document.querySelector(`tr[data-id="${product.id}"]`).style.display = "none"
    })

    if (!filteredList.length) {
        $("tr[data-options]").show()
    }

    calcOptionsCount(filteredList)
}

// Функция для сравнения объектов
function compareObjects(obj1, obj2) {
    for (let p in obj1) {
        if (Object.prototype.hasOwnProperty.call(obj1, p)) {
            if (obj1[p] !== obj2[p]) {
                return false;
            }
        }
    }
    for (let p in obj2) {
        if (Object.prototype.hasOwnProperty.call(obj2, p)) {
            if (obj1[p] !== obj2[p]) {
                return false;
            }
        }
    }
    return true;
};


function calcOptionsCount(itemsList) {
    const inputsArr = document.querySelectorAll(".filter__checkbox")
    const productsList = products.filter(x => !itemsList.some(y => compareObjects(x, y)));

    console.log(productsList);

    inputsArr.forEach(input => {
        let counter = 0
        let optionKey = input.closest(".filter__item")
        optionKey = optionKey.getAttribute("data-filter").trim()
        let option = input.querySelector(".filter__checkbox-name").textContent.trim()

        console.log(option);
        console.log(optionKey);
        productsList.forEach(product => {
            let optionName = product.filterOptions[optionKey]
            optionName ? optionName = optionName.trim() : false;

            if (option === optionName) {
                counter++
            }

        })

        input.querySelector(".filter__counter").textContent = ` (${counter})`
    })
}


$(".filter").on("change", ".filter__checkbox", filterProducts)



// -----------Блок сортировки----------

function sortProducts(e) {
    let type = $(e.target).attr("name");
    $(e.target).prop("checked") ? type += "_down" : type += "_up";

    let itemsList = document.querySelectorAll(".table tbody tr")
    let arraysList = {}
    let count = 0


    itemsList.forEach(item => {
        if (item.classList.contains("table-title")) {
            count++
        }

        if (arraysList[count]) {
            arraysList[count].push(item)
        } else {
            arraysList[count] = new Array()
            arraysList[count].push(item)
        }

        if (item.classList.contains("table-title")) {
            count++
        }
    })

    if (type === "price_down") {
        for (let arr in arraysList) {
            arraysList[arr].sort((a, b) => {
                a = parseInt(a.querySelector(".table-price").textContent)
                b = parseInt(b.querySelector(".table-price").textContent)

                return a - b
            })
        }
    } else if (type === "price_up") {

        for (let arr in arraysList) {
            let prodArr = arraysList[arr]
            if (prodArr[0].classList.contains(".table-price")) {
                continue
            }
            arraysList[arr].sort((a, b) => {
                a = parseFloat(a.querySelector(".table-price").textContent)
                b = parseFloat(b.querySelector(".table-price").textContent)
                console.log(a);

                return b - a
            })
        }
    }

    document.querySelector(".table tbody").innerHTML = ""

    for (let arr in arraysList) {
        arraysList[arr].forEach(item => {
            document.querySelector(".table tbody").append(item)
        })
    }
}

$(".sort-panel").on("change", ".sort-panel__item input", sortProducts)

