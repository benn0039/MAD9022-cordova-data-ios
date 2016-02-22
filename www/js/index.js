/*jslint devel: true, evil: false, plusplus: true, sloppy: true, white: true, indent: 4*/

    [] add dialog listeners
    [] logic
    [] database stuff
    [] remove debug alert
*/
var app = {
	loadRequirements: 0,
    currentPage: null,
    otherPage: null,
    hammer_list: null,
    hammer_list1: null,
    hammer_list2: null,
    hammer_list3: null,
    hammer_page: null,
    hammer_page1: null,
    hammer_page2: null,
    hammer_page3: null,
    hammer_btn: null,
    hammer_btn1: null,
    hammer_btn2: null,
    hammer_btn3: null,
    hammer_save: null,
    hammer_save1: null,
    hammer_cancel: null,
    hammer_cancel1: null,
    db: null,
    currentTarget: null,
    currentName: null,
    peoplePage: document.getElementById('people'),
    occasionPage: document.getElementById('occasions'),
    giftPeoplePage: document.getElementById('gift_by_person'),
    giftOccasionPage: document.getElementById('gift_by_occasion'),
    
	init: function() {
		document.addEventListener("deviceready", app.onDeviceReady);
		document.addEventListener("DOMContentLoaded", app.onDomReady);
	},
    
	onDeviceReady: function() {
		app.loadRequirements++;
		if (app.loadRequirements === 2) {
            app.listeners();
            app.checkDB();
            app.people();
            alert("Once you are on the 'Gifts for... ' pages, swipe to get back");
		}
	},
    
	onDomReady: function() {
		app.loadRequirements++;
		if (app.loadRequirements === 2) {
            app.listeners();
            app.checkDB();
            app.people();
		}
	},
	
    ///////////////////////////////////////////////////////
    //   DIALOGS
    
    addPerson: function() {
        //display dialog
        var dialog = document.querySelector('.dlg_input'),
            dialogLabel = document.querySelector('.dialog_label'),
            saveBtn = document.querySelector('#btn_save'),
            input = document.querySelector('#input_person'),
            cancelBtn = document.querySelector('#btn_cancel');
        
        dialog.style.display = 'block';
        dialogLabel.textContent = "Add a New Person";
        app.hammer_cancel.on('tap', function(){ dialog.style.display = 'none';});
       
        app.hammer_save.on('tap', function(ev) { 
                app.db.transaction(function(trans) {
                        trans.executeSql("INSERT INTO people(person_name) VALUES('" +input.value + "')");
                    }, app.errFunc, function() {
                                        app.people();
                                        input.value = null;   
                                        dialog.style.display = 'none';  
                                        app.hammer_save = null; // was getting what I think were surviving instances of the listeners each time the functio ran.... this seems to kill it. 
                                    });
                }); 
        
    },
    
    addOccasion: function() {
        var dialog = document.querySelector('.dlg_input'),
            dialogLabel = document.querySelector('.dialog_label'),
            saveBtn = document.querySelector('#btn_save'),
            input = document.querySelector('#input_person'),
            cancelBtn = document.querySelector('#btn_cancel');
        
        dialog.style.display = 'block';
        dialogLabel.textContent = "Add a New Occasion";
        app.hammer_cancel.on('tap', function(){ dialog.style.display = 'none';});
        
        app.hammer_save.on('tap', function(ev) { 
                app.db.transaction(function(trans) {
                        trans.executeSql("INSERT INTO occasions(occ_name) VALUES('" +input.value + "')");
                    }, app.errFunc, function() {
                                        app.occasion();
                                        input.value = null;   
                                        dialog.style.display = 'none';  
                                        app.hammer_save = null;
                                    });
                }); 
        
    },
    
    addGiftByPerson: function() {
        var dialog = document.getElementById('dlg1'),
            dialogLabel = document.getElementById('dialog_label'),
            choice = document.getElementById('events'),
            input = document.getElementById('input_person1');
            
        // load  up select list with options
        app.db.transaction(app.dropOccasions, app.errFunc, app.successFunc);
        dialogLabel.textContent = "Add a New Gift";
        dialog.style.display = 'block';
        app.hammer_cancel1.on('tap', function(){ dialog.style.display = 'none';});
        
        app.hammer_save1.on('tap', function(ev) { 
                app.db.transaction(function(trans) {
                        trans.executeSql("INSERT INTO gifts(person_id, occ_id, gift_idea) VALUES('"+app.currentTarget +"','"+choice.value+"','"+input.value+"')");
                    }, app.errFunc, function() {
                                        app.giftsByPerson();
                                        input.value = null;   
                                        dialog.style.display = 'none';  
                                        app.hammer_save1 = null;
                                    });
                }); 
    },
    
    addGiftByOccasion: function() {
        var dialog = document.getElementById('dlg1'),
            dialogLabel = document.getElementById('dialog_label'),
            saveBtn = document.getElementById('btn_save1'),
            cancelBtn = document.getElementById('btn_cancel1');
        
        dialog.style.display = 'block';
        dialogLabel.textContent = "Add a New Occasion";
        app.hammer_cancel1.on('tap', function(){ dialog.style.display = 'none';});
        
    },
    
//  END DIALOGS
// 
///////////////////////////////////////////////////////
// 
// SWIPE DISPATCH
//
    
    showPage: function() {
        var currentId = app.currentPage.getAttribute('id');
        if (currentId === 'people') {
            app.occasion();
        } else if(currentId === 'occasions') {
            app.people();
        } else if (currentId === 'gift_by_person') {
            app.people();
        } else {
            app.occasion();
        }
    },
    
    people: function() {
        app.currentPage = app.peoplePage;
        app.peoplePage.style.display = 'block';
        app.occasionPage.style.display = 'none';
        app.giftPeoplePage.style.display = 'none';
        app.giftOccasionPage.style.display = 'none';
        app.db.transaction(app.getPeople, app.errFunc, app.successFunc);
	},
    
    occasion: function() {
        app.currentPage = app.occasionPage;
        app.occasionPage.style.display = 'block';
        app.peoplePage.style.display = 'none';
        app.giftPeoplePage.style.display = 'none';
        app.giftOccasionPage.style.display = 'none';
        app.db.transaction(app.getOccasions, app.errFunc, app.successFunc);
    },
    
    giftsByPerson: function() {
        app.currentPage = app.giftPeoplePage;
        app.giftPeoplePage.style.display = 'block';
        app.peoplePage.style.display = 'none';
        app.occasionPage.style.display = 'none';
        app.giftOccasionPage.style.display = 'none';
        app.db.transaction(app.getGiftsPeople, app.errFunc, app.successFunc);
    },
    
    giftsByOccasion: function() {
        app.currentPage = app.giftOccasionPage;
        app.giftOccasionPage.style.display = 'block';
        app.peoplePage.style.display = 'none';
        app.occasionPage.style.display = 'none';
        app.giftPeoplePage.style.display = 'none';
    },
    
//  END SWIPE DISPATCH
// 
///////////////////////////////////////////////////////
    
    listeners: function() {
        ///////////////////////////////////////////////////////////
        //people page listeners
        var addBtn = document.querySelector('#add_people'),
            page = document.getElementById('people'),
            list = document.getElementById('people_list');
        app.hammer_list = new Hammer(list, {});
        var singleTap = new Hammer.Tap({ event: 'tap' }),
            doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2 });
        app.currentPage = page;
        app.hammer_list.add([doubleTap, singleTap]);
        doubleTap.requireFailure(singleTap);
        
        app.hammer_list.on('doubletap', function(ev) { 
            app.db.transaction(function(trans) {
                trans.executeSql('DELETE FROM people WHERE person_id = ' + ev.target.id)
            }, app.errFunc, app.people);
        });    
        
        app.hammer_list.on('tap', function(ev) {
            app.currentTarget = ev.target.id;
            app.currentName = ev.target.textContent;
            app.giftsByPerson();
        });
        app.hammer_page = new Hammer(page);
        app.hammer_btn = new Hammer(addBtn);
        app.hammer_page.on('swipe', app.showPage);
        app.hammer_btn.on('tap', app.addPerson);
        
        ///////////////////////////////////////////////////////////
        //occasion page listeners
        var addBtn1 = document.querySelector('#add_occasion'),
            page1 = document.getElementById('occasions'),
            list1 = document.getElementById('occasion_list');
        app.hammer_list1 = new Hammer(list1, {});
        var singleTap1 = new Hammer.Tap({ event: 'tap' });
        var doubleTap1 = new Hammer.Tap({ event: 'doubletap', taps: 2 });
        app.currentPage = page1;
        app.hammer_list1.add([doubleTap1, singleTap1]);
        doubleTap1.requireFailure(singleTap1);
        
        app.hammer_list1.on('doubletap', function(ev) { 
            app.db.transaction(function(trans) {
                trans.executeSql('DELETE FROM occasions WHERE occ_id = ' + ev.target.id)
            }, app.errFunc, app.occasion);
        });  
        
        app.hammer_list1.on('tap', app.giftsByOccasion);
        app.hammer_page1 = new Hammer(page1);
        app.hammer_btn1 = new Hammer(addBtn1);
        app.hammer_page1.on('swipe', app.showPage);
        app.hammer_btn1.on('tap', app.addOccasion);
        
        ///////////////////////////////////////////////////////////
        // gifts by people page listeners
        var addBtn2 = document.querySelector('#add_gift_people'),
            page2 = document.getElementById('gift_by_person'),
            list2 = document.getElementById('gift_list');
        app.hammer_list2 = new Hammer(list2, {});
        app.hammer_btn2 = new Hammer(addBtn2);
        app.hammer_page2 = new Hammer(page2);
        var singleTap2 = new Hammer.Tap({ event: 'tap' }),
            doubleTap2 = new Hammer.Tap({ event: 'doubletap', taps: 2 });
        app.currentPage = page2;
        app.hammer_list2.add([doubleTap2, singleTap2]);
        doubleTap2.requireFailure(singleTap2);
        
        // delete selected item 
        app.hammer_list2.on('doubletap', function(ev) { 
            app.db.transaction(function(trans) {
                trans.executeSql('DELETE FROM gifts WHERE gift_id = ' + ev.target.id)
            }, app.errFunc, app.giftsByPerson);
        }); 
        
        // mark as purchased
         app.hammer_list2.on('tap', function(ev) { 
            app.db.transaction(function(trans) {
                trans.executeSql('UPDATE gifts SET purchased = 1 WHERE gift_id = ' + ev.target.id)
            }, app.errFunc, app.giftsByPerson);
        }); 
        
        //save a new gift for selected person
        app.hammer_btn2.on('tap', app.addGiftByPerson);
        app.hammer_page2.on('swipe', app.showPage);
        
        ///////////////////////////////////////////////////////////
        //  gifts by occasion listeners
         var addBtn3 = document.querySelector('#add_gift_occasion'),
            page3 = document.getElementById('gift_by_occasion'),
            list3 = document.getElementById('gift_occasion_list');
        app.hammer_list3 = new Hammer(list3, {});
        app.hammer_btn3 = new Hammer(addBtn3);
        app.hammer_page3 = new Hammer(page3);
        var singleTap3 = new Hammer.Tap({ event: 'tap' }),
            doubleTap3 = new Hammer.Tap({ event: 'doubletap', taps: 2 });
        app.currentPage = page3;
        app.hammer_list3.add([doubleTap3, singleTap3]);
        doubleTap3.requireFailure(singleTap3);
        app.hammer_list3.on('doubletap', function() { alert("Gift by Occasion Double Tap works"); });        
        //app.hammer_btn3.on('tap', app.addGiftByOccasion);
        app.hammer_page3.on('swipe', app.showPage);
        
        ///////////////////////////////////////////////////////////
        //  dialog listeners
        
        var save1 = document.getElementById('btn_save1');
        var cancel = document.getElementById('btn_cancel');
        var cancel1 = document.getElementById('btn_cancel1');
        var save = document.getElementById('btn_save');
        app.hammer_save = new Hammer(save);
        app.hammer_save1 = new Hammer(save1);
        app.hammer_cancel = new Hammer(cancel);
        app.hammer_cancel1 = new Hammer(cancel1);
    },
    
    /*************************************************************************************
   
            DATABASE STUFF

    *************************************************************************************/
    
    // check for db or create if needed.  
    checkDB: function() {
        app.db = openDatabase("giftr", "", "giftR", 1024000);
        app.db.transaction(app.createDB, app.errFunc, app.successFunc);
        app.db.transaction(app.primeDB, app.errFunc,app.successFunc);
    },
    
    /////////////////////////////////////////////////////
    //  callbacks for db.transaction methods
    
     createDB: function(trans) {
        trans.executeSql("CREATE TABLE IF NOT EXISTS people(person_id INTEGER PRIMARY KEY, person_name VARCHAR  )");
        trans.executeSql("CREATE TABLE IF NOT EXISTS occasions(occ_id INTEGER PRIMARY KEY, occ_name VARCHAR )");
        trans.executeSql("CREATE TABLE IF NOT EXISTS gifts(gift_id INTEGER PRIMARY KEY, person_id INTEGER, occ_id INTEGER, gift_idea VARCHAR , purchased INTEGER)");
    },
    
    primeDB: function(trans) {
//         trans.executeSql("INSERT INTO people(person_name) VALUES('Justin')");
//         trans.executeSql("INSERT INTO people(person_name) VALUES('Harry')");
//         trans.executeSql("INSERT INTO occasions(occ_name) VALUES('Birthday')");
//         trans.executeSql("INSERT INTO gifts(person_id, occ_id, gift_idea) VALUES(1, 1,'Microwave')");
//         trans.executeSql("INSERT INTO gifts(person_id, occ_id, gift_idea) VALUES(1, 1,'Aston Martin Vanquish')");
        
//         trans.executeSql("DROP TABLE people");
//         trans.executeSql("DROP TABLE occasions");
//         trans.executeSql("DROP TABLE gifts");
    },
    
    errFunc: function(err) {
        console.log("uh oh, looks like an error... " +err.message);
    },
    
    successFunc: function() {
        console.log('Success!!');
    },
    
    /////////////////////////////////////////////////////
    //  People page database stuff
     getPeople: function(trans) {
        var sqlString = "SELECT * FROM people";
        trans.executeSql(sqlString, [], app.getPeopleSuccess, app.errFunc);
    },
    
    getPeopleSuccess: function(trans, results) {
        var count = results.rows.length;
        var list = document.querySelector('#people_list');
        list.innerHTML = null;
        
        for(var cnt = 0; cnt<count; cnt++) {
            var newElem = document.createElement('li');
            newElem.setAttribute('id', results.rows.item(cnt).person_id);
            newElem.setAttribute('class', 'list_content');
            newElem.textContent = results.rows.item(cnt).person_name;
            list.appendChild(newElem);
        }
    },
    
    /////////////////////////////////////////////////////
    // Occasions page database stuff
    getOccasions: function(trans) {
        var sqlString = "SELECT * FROM occasions";
        trans.executeSql(sqlString, [], app.getOccasionSuccess, app.errFunc);
    },
    
    getOccasionSuccess: function(trans, results) {
        var count = results.rows.length;
        var list = document.querySelector('#occasion_list');
        list.innerHTML = null;
        
        for(var cnt = 0; cnt<count; cnt++) {
            var newElem = document.createElement('li');
            newElem.setAttribute('id', results.rows.item(cnt).occ_id);
            newElem.setAttribute('class', 'list_content');
            newElem.textContent = results.rows.item(cnt).occ_name;
            list.appendChild(newElem);
        }
    },
    
    /////////////////////////////////////////////////////
    // Gift by People page database stuff
    getGiftsPeople: function(trans) {
        var sqlString = "SELECT g.purchased, g.gift_id, g.gift_idea, o.occ_name FROM gifts AS g INNER JOIN occasions as o ON o.occ_id = g.occ_id WHERE g.person_id =" + app.currentTarget + "  ORDER BY purchased, o.occ_name, g.gift_idea";
        trans.executeSql(sqlString, [], app.getGiftsPeopleSuccess, app.errFunc);
    },
    
    getGiftsPeopleSuccess: function(trans, results) {
        var count = results.rows.length;
        var list = document.querySelector('#gift_list'),
            label = document.querySelector("#gift_by_person .page_label");
        label.textContent = "Gifts for " + app.currentName;
        list.innerHTML = null;
        
        for(var cnt = 0; cnt<count; cnt++) {
            var newElem = document.createElement('li');
             
            if (results.rows.item(cnt).purchased === 1){
                newElem.setAttribute('class', 'list_content purchased');
            } else {
                 newElem.setAttribute('class', 'list_content');
            }
            newElem.setAttribute('id', results.rows.item(cnt).gift_id);
            newElem.setAttribute('data-role', results.rows.item(cnt).person_id);
           
            newElem.textContent = results.rows.item(cnt).occ_name + " - " +results.rows.item(cnt).gift_idea;
            list.appendChild(newElem);
        }
    },
    
    /////////////////////////////////////////////////////
    // drop down Occasions.. omg
    dropOccasions: function(trans) {
        var sqlString = "SELECT * FROM occasions";
        trans.executeSql(sqlString, [], app.dropOccasionSuccess, app.errFunc);
        
    },
    
    dropOccasionSuccess: function(trans, results) {
        var recordCnt = results.rows.length,
            eventList = document.getElementById('events');
        eventList.innerHTML = "";
        
            for(var cnt = 0; cnt<recordCnt; cnt++) {
                var newOpt = document.createElement('option');
                newOpt.setAttribute('value', results.rows.item(cnt).occ_id);
                newOpt.textContent = results.rows.item(cnt).occ_name;
                eventList.appendChild(newOpt);
            }
    },
};

app.init();
// where do i turn off listeners????
