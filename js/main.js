/**
 * @description Populated in parseIntoHTML function with each time of a show of a movie
 * Id of a time selector in section 1 is a key in this dictionary
 * dictionary structure 
 * showings["showing_xxxx"] = {
 *      "seats": [String of 15 of 0 or 1,...],
 *      "hour": Integer between 0 - 59,
 *      "minute": Integer between 0 - 59,
 *      "day": Integer between 1 - 31,
 *      "month": Integer between 0 - 11,
 *      "year": Integer,
 *      "price": Float,
 *      "title": String,
 *      "description": String,
 *      "duration": String,
 *      "img": image location relative to project root
 * }
 */
showings = {};
/**
 * @description Global variable for number of tickets updated by its selector in 2nd section 
 * Used to keep track of maximum seats.
 */
ticketsAmount = 1;
/**
 * @description List of bought tickets for billing section
 * list structure
 * tickets[x] = {
 *      "showing": key to showings dict,
 *      "row":Number,
 *      "column":Number,
 * }
 */
tickets = [];
/**
 * @description List of letters for row of the seats
 */
seatingRowLetters = ["O","N","M","L","K","J","I","H","G","F","E","D","C","B","A"];

$(document).ready(function() {
    /** Sets up accordion */
    $("#movie-accordion").accordion({
        heightStyle: "content",
        collapsible: true
    });
    setupDatepicker();
    setupTimeSelector();
    /** Buttons setup */
    $("#movie-accept").button();
    $("#movie-accept").on("click", clickMovieAccept);
    $("#tickets-accept").button();
    $("#tickets-accept").on("click", clickTicketAccept);
    $("#seats-accept").button();
    $("#seats-accept").on("click", clickSeatsAccept);
    $("#seats-accept").button("disable");
    $("#another-movie-accept").button();
    $("#another-movie-accept").on("click", clickAnotherMovieAccept);
    $("#billing-accept").button();
    /** --- */
    setupMovieTable();
    setupTicketsBuyTable();
    setupBillingTable();
    setupTicketsAmountSelectmenu();
    
    parseIntoHTML();
} );
/**
 * @description Initializes Datepicker for current day
 */
setupDatepicker = function(){
    $("#datepicker").datepicker({
        dateFormat: 'dd-mm-yy',
        onSelect: (date, inst)=>{
            tickets = [];
            showings = {};
            if($($("#movie-accordion h3").get(0)).hasClass("ui-accordion-header-collapsed")){
                $("#movie-accordion h3").get(0).click();
            };
            parseIntoHTML();
        }
    });
    $("#datepicker").datepicker("setDate",new Date());
}
/**
 * @description Initializes selectors for time of a movie
 */
setupTimeSelector = function(){
    $(".time-selector" ).selectable({
        selected: function(event, ui) {
            $(".time-selector li").removeClass("ui-selected");
            $(ui.selected).addClass("ui-selected");
        },
        selecting: function(event, ui) {
            $(".time-selector li").removeClass("ui-selected");
        },
        cancel: ".show-cancel"
    });
}
/**
 * @description Initializes ticket amount selection
 */
setupTicketsBuyTable = function(){
    $("#tickets-buy-table").DataTable({
        "lengthChange": false,
        "searching": false,
        "paging": false,
        "ordering": false,
        "bInfo": false
    });
}
/**
 * @description Initializes table of movies
 */
setupMovieTable = function() {
    $('#movie-table').DataTable( {
        "scrollY":        "400px",
        "scrollCollapse": true,
        "paging":         false,
        "lengthChange": false,
        "ordering": false,
        "autoWidth": true,
        "bInfo": false,
        "columns": [
            { "visible": false },
            { "searchable": false, "width":"auto" },
            { "searchable": false, "width":"100px" },
            { "searchable": false, "width":"120px" },
            { "searchable": false, "width":"120px" },
            { "searchable": false, "width":"120px" },
            { "searchable": false, "width":"120px" },
            { "searchable": false, "width":"120px" },
            { "searchable": false, "width":"120px" },
            { "searchable": false, "width":"120px" }
        ]
    } );
}
/**
 * @description Initializes table of all tickets purchased
 */
setupBillingTable = function() {
    $('#billing-table').DataTable( {
        "scrollY":        "400px",
        "scrollCollapse": true,
        "searching": false,
        "paging":         false,
        "lengthChange": false,
        "ordering": false,
        "bInfo": false,
        "autoWidth":true,
        "columns": [
            {"width":"0px" },
            {"width":"auto" },
            {"width":"auto" },
            {"width":"auto" }
        ]
    } );
}
/**
 * @description Initializes grid of seats in section 3
 */
setupSeatsGrid = function(){
    var lastSelected = []; /** List of last selected selectables */
    $("#seats-grid ol").selectable({
        selected: function(event, ui) {
            let select = $(ui.selected).filter("li").not(".seat-cancel").first();
            if(select.length==0)return; /** If selected was called falsly */
            let find = lastSelected.find((e,index) => {
                if(e["0"] == select["0"]){
                    lastSelected.splice(index,1);
                    return true;
                }
            });
            if(find == null){ /** If the selected is not a part of lastSelected then add it */
                lastSelected.push(select);
            }
            while(lastSelected.length > ticketsAmount){
                lastSelected.shift(); /**remove all extra selected */
            }
            if(lastSelected.length == ticketsAmount) { /** disable button if all seats are not picked */
                $("#seats-accept").button("enable");
            }else{
                $("#seats-accept").button("disable");
            }
            $("#seats-grid ol .ui-selected").removeClass("ui-selected");/**remove all ui-selected*/
            lastSelected.forEach(e => {/**add all part of lastSelected ui-selected */
                $(e).addClass("ui-selected");
            });
        },
        unselecting: function(event, ui){
            $("#seats-grid ol .ui-selected").removeClass("ui-selected"); /**manually removing .ui-selected from selectables */
            lastSelected.forEach(e => {
                $(e).addClass("ui-selected");
                $(e).children().addClass("ui-selected");
            });
        },
        cancel: ".seat-cancel"
    });
}
/**
 * @description Initializes select menu for #tickets-amount
 */
setupTicketsAmountSelectmenu = function(){
    $("#tickets-amount").selectmenu().selectmenu("menuWidget").addClass("tickets-amount-overflow");
    $("#tickets-amount").on("selectmenuselect", function(event, ui) {
        ticketsAmount = ui.item.value;
        $("#tickets-total").html(Number(Number($("#tickets-total").attr("value-sec"))*ticketsAmount).toFixed(2) + " kn");
        $("#tickets-buy-table").DataTable().draw();
    });
}
/**
 * @description Compiles data from a database into HTML elements.
 * There is no month so it was emulated.
 * Current day and onward is in current month while any day less is in month onward.
 * And shows are sorted in that way.
 * 
 * Column 1 is invisible and its title of the movie for search purposes.
 * Column 2 is picture of the movie.
 * Column 3 is title, duration and description.
 * First 7 days from current day are in columns from 4 to 10
 * 
 * Table gets cleared so it can be repopulated. 
 * Each movie gets its showings sorted.
 * If current day +[0-6] is equal to a showing day then the showing is added as a time selector
 * Movie is then added as a row to #movie-table
 */
parseIntoHTML = function(){
    let date = $("#datepicker").datepicker("getDate");
    let table = $("#movie-table").DataTable();
    table.clear();
    let showingsID = 1000;
    $.getJSON("data/db.json").done((data) => {
        data.forEach(movie => {
            let title = movie["title"];
            let description = movie["description"];
            let duration = movie["duration"];
            let img = movie["img"];
            let shows = movie["showings"];
            outImg = `<img class="movie-image" src="${img}"/>`
            outTitle = `<label>${title}</label>
                <label>${duration}</label>
                <text>${description}</text>`;
            /** 
             * Sorting where current day is the lowest number 
             * e.g. current day is 25/08
             * 25,26,27,28,29,30,31,1,2,3,4,..
             */
            shows.sort((f1,f2) => {
                if(f1["day"] >= date.getDate() && f2["day"] < date.getDate()){ return -1; }
                if(f1["day"] < date.getDate() && f2["day"] >= date.getDate()){ return 1; }
                if(f1["day"] < f2["day"]){ return -1; }
                if(f1["day"] > f2["day"]){ return 1; }
                if(f1["hour"] < f2["hour"]){ return -1; }
                if(f1["hour"] > f2["hour"]){ return 1; }
                if(f1["minute"] < f2["minute"]){ return -1; }
                if(f1["minute"] >= f2["minute"]){ return 1; }
            });
            let dayd = ["","","","","","",""]; /**HTML for each cell of week column */
            dayd.forEach((elem,i,array) => { 
                array[i] += '<ol class="time-selector">';
            });
            let blockMax = 6; /** Maximum list size*/
            let blockCount = blockMax; /** Counts size of current block*/
            let dayCompare = 0; /** For tracking if next show is different day. */
            let dayCount = 0; /** Current index of dayc */
            let dayc = [0,0,0,0,0,0,0]; /** [current day,current day+1,current day+2,...] */
            let dateTemp = $("#datepicker").datepicker("getDate");

            dayc.forEach((elem,i,array)=>{
                array[i] = dateTemp.getDate();
                dateTemp.setDate(dateTemp.getDate()+1);
            });
            shows.forEach((elem) => {
                dayCount = -1;
                dayc.forEach((el,i) => {
                    if(el === elem["day"]) dayCount = i;
                });
                if(dayCount < 0) return; /** If day of the show doesnt match any of dayc then dont process the show */
                if(blockCount == 0){
                    dayd[dayCount] += '</ol><ol class="time-selector">';
                    blockCount = blockMax; 
                }
                blockCount -= 1;
                
                let dateTemp = $("#datepicker").datepicker("getDate");
                dateTemp.setDate(dateTemp.getDate()+dayCount);/** Get full date for current show */
                let showingsTemp = {}; /** Gathering data to populate showings */
                showingsTemp["seats"] = elem["seats"];
                showingsTemp["hour"] = elem["hour"];
                showingsTemp["minute"] = elem["minute"];
                showingsTemp["day"] = elem["day"];
                showingsTemp["month"] = dateTemp.getMonth();
                showingsTemp["year"] = dateTemp.getFullYear();
                showingsTemp["price"] = elem["price"];
                showingsTemp["title"] = title;
                showingsTemp["description"] = description;
                showingsTemp["duration"] = duration;
                showingsTemp["img"] = img;
                showings[`showing_${showingsID}`] = showingsTemp;

                dayd[dayCount] += `<li id="showing_${showingsID}">
                    ${elem["hour"]<10?"0":""}${elem["hour"]}:${elem["minute"]<10?"0":""}${elem["minute"]}</li>`;
                /** 
                 * For tracking if next show is different day. If its different, blockCount is reset.
                */
                let dayDiff = elem["day"] - date.getDate(); 
                if(dayCompare != dayDiff) { 
                    dayCompare = dayDiff; blockCount = blockMax;
                }
                showingsID += 1;
            });
            dayd.forEach((elem,i,array) => { array[i] += '</ol>'; });
            /** Appending row to the table. Adding classes to appropriate cell. */
            $(table.row.add([title,outImg,outTitle,dayd[0],dayd[1],dayd[2],dayd[3],dayd[4],dayd[5],dayd[6]])
                .node()).find("td").each((i,e) => {
                    switch(i){
                        case 1:
                        $(e).addClass("movie-title"); break;
                        case 2: case 3: case 4: case 5: case 6: case 7: case 8:
                        $(e).addClass("movie-time-selection"); break;
                        default: break;
                    }
                });
        });
        let count = -3;
        let day = $("#datepicker").datepicker("getDate"); /** Current day */
        /** Sets column[4 to 10] headers for each day of the following week */
        $(table.tables().header()).find("th").each((i,e) => {
            count += 1;
            if(count < 0) return;
            $(e).html(`${day.getDate()<10?"0":""}${day.getDate()}/${day.getMonth()+1<10?"0":""}${day.getMonth()+1}`);
            day.setDate(day.getDate()+1);
        });
        table.draw();
        setupTimeSelector();
    }).fail((jq, status, error)=>{
        console.log(jq,status,error);
    });
};
/**
 * @description On click for #movie-accept button.
 * When a time of a movie has been selected in section 1 it sets up seats
 * and it counts free seats available for ticket amount selector #ticket-amount count
 * @param event pointer event
 */
clickMovieAccept = function(event){
    let show = $(".time-selector .ui-selected");
    if(show.length === 0) {
        event.preventDefault();
        return;
    }
    let showFound = showings[show.attr("id")]; /** The selected show */
    let out = "";
    let freeSeats = 0; /** Counter for available seats, used by #tickets-amount */
    let widthSeats = 0; /** Used to count width for seat position marker */
    /** Sets up seats for #seats-grid */
    showFound["seats"].forEach((elem,i) => {
        out += `<ol><li class="seat-cancel marking">${seatingRowLetters[i]}</li>`;
        for(let a=0; a<elem.length; a++){
            let b = elem.charAt(a)==1?true:false;
            freeSeats += b?1:0;
            out += `<li${b?'':' class="seat-cancel"'}  column="${a}" row="${i}">
                <img src="img/seat-${b?'open':'closed'}.png"></li>`;
        };
        widthSeats = elem.length;
        out += "</ol>";
    });
    let preOut = "<ol>";
    for(let i=0; i< widthSeats+1; i++){
        preOut += `<li class="seat-cancel marking">${i<1?"":i}</li>`
    }
    preOut += "</ol>"
    $("#seats-grid").html(preOut + out);
    /** Compiled HTML for #tickets-amount selector  */
    let outTickets = '<option selected="selected">1</option>';
    for(let i=1; i<freeSeats && i < 20; i++){
        outTickets += `<option>${i+1}</option>`
    }
    $("#tickets-amount").html(outTickets);
    $("#tickets-amount").selectmenu("refresh");
    $("#tickets-name").html(showFound["title"]);
    $("#tickets-price").html(showFound["price"]+" kn");
    $("#tickets-total").attr("value-sec",Number(showFound["price"]));
    $("#tickets-total").html(Number(Number($("#tickets-total").attr("value-sec"))*ticketsAmount).toFixed(2) + " kn");

    $("#tickets-buy-table").DataTable().draw();
    setupSeatsGrid();
    $("#movie-accordion h3").get(1).click(); /** Open section 2 */
}
/**
 * @description On click for #tickets-accept button
 * Disables #seats-accept button to make sure all seats are accepted.
 * @param event pointer event
 */
clickTicketAccept = function(event){
    $("#seats-accept").button("disable");
    $("#movie-accordion h3").get(2).click(); /** Open section 3 */
}
/**
 * @description On click for #seats-accept button
 * Adds tickets for each seat taken.
 * Clears #billing-table to repopulate with all tickets chosen
 * from global variable tickets
 * @param event pointer event
 */
clickSeatsAccept = function(event){
    let table = $("#billing-table").DataTable();
    let show = $(".time-selector .ui-selected").attr("id");
    table.clear();
    $("#seats-grid .ui-selected").filter("li").not(".seat-cancel").each((i,elem)=>{
        tickets.push({"showing":show,"row":Number($(elem).attr("row")),"column":Number($(elem).attr("column"))})
    })
    /**
     * Compile each ticket into table row
     */
    tickets.forEach((elem,index) => {
        let showTicket = showings[elem["showing"]]
        let row = ["","","",""];
        row[0] += `<img class="movie-image" src="${showTicket["img"]}">`;
        row[1] += `<label>${showTicket["title"]}</label>`;
        row[1] += `<label>${showTicket["hour"]<10?"0":""}${showTicket["hour"]}:`;
        row[1] += `${showTicket["minute"]<10?"0":""}${showTicket["minute"]}   `;
        row[1] += `${showTicket["day"]<10?"0":""}${showTicket["day"]}/`;
        row[1] += `${showTicket["month"]+1<10?"0":""}${showTicket["month"]+1}/${showTicket["year"]}</label>`,
        row[1] += `<label>Seat ${seatingRowLetters[elem["row"]]}${elem["column"]+1}</label>`;
        row[2] += `<label">${showTicket["price"]} kn</label>`
        row[3] += `<button>Remove</button>`
        $(table.row.add([row[0],row[1],row[2],row[3]]).node()).find("td").each((index,elem)=>{
            switch(index){
                case 0: $(elem).addClass("billing-picture"); break;
                case 1: $(elem).addClass("movie-title"); break;
                case 2: $(elem).css("width","10000px").css("text-align","center"); break;
                case 3: break;
            }
        });
    })
    table.draw();
    /**
     * Sets up #billing-table button to remove its parent row from the table and tickets
     */
    $("#billing-table button").button();
    $("#billing-table button").on("click",(event)=>{
        let parent = $(event.target).parents('tr')
        parent.fadeOut(300, () => {
            tickets.splice(parent.index($(event.target)),1)
            table.row( $(event.target).parents('tr') ).remove().draw();
            setBillingTotalPrice();
        })
    });
    $("#movie-accordion h3").get(3).click(); /** Open section 4 */
    setBillingTotalPrice();
    $('#billing-table').DataTable().columns.adjust()
}
/**
 * @description On click for #another-movie-accept button
 * Opens section 1 for another movie selection
 * Disables movie time for previously selected movie time in tickets
 * @param event pointer event
 */
clickAnotherMovieAccept = function(event) {
    tickets.forEach((elem) => {
        $(`#${elem["showing"]}`).removeClass("ui-selected")
        $(`#${elem["showing"]}`).addClass("show-cancel")
    });
    $("#movie-accordion h3").get(0).click(); /** Open section 1 */
    $('#movie-table').DataTable().columns.adjust()
}
/**
 * @description Updates total price in #billing-table
 */
setBillingTotalPrice = function() {
    let total = 0;
    tickets.forEach((elem)=>{ total += Number(showings[elem["showing"]]["price"]); });
    $($($('#billing-table').DataTable().table().footer()).find("td").get(2)).html(`${total.toFixed(2)} kn`)
}
