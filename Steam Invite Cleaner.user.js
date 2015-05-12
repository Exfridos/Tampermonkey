// ==UserScript==
// @name         Steam Invite Cleaner
// @namespace    http://www.nuessafura.com/
// @version      1.0
// @description  Identifies suspicious profiles and mark them for the user to see
// @author       Exfridos
// $downloadUrl	 https://raw.githubusercontent.com/Exfridos/Userscripts/master/Steam%20Invite%20Cleaner.user.js
// @run-at       document-end
// @require      http://code.jquery.com/jquery-latest.js
// @match        http://steamcommunity.com/id/*/home/invites/
// @match        https://steamcommunity.com/id/*/home/invites/
// @match        http://steamcommunity.com/profiles/*/home/invites/
// @match        https://steamcommunity.com/profiles/*/home/invites/
// ==/UserScript==

/*jshint multistr: true */

var a_Cache = GM_getValue("a_Cache", {});
var a_Settings = GM_getValue("a_Settings", {"inv": true});

GM_addStyle('               			\
	div#SIC {			      			\
		margin-top: -12px;				\
		margin-right: 12px;				\
        text-align: right;     			\
    }                       			\
                            			\
    .scammer_warning {      			\
        color: red;         			\
    }                       			\
                            			\
    .scammer_btn {          			\
        color: orange;      			\
    }                       			\
                            			\
    .scammer_btn.setting {  			\
        margin-top: 8px; \
    }                       			\
                            			\
    .scammer_btn.setting.on {  			\
        border-bottom: solid 2px green; \
    }                       			\
                            			\
    .scammer_btn.setting.off {  		\
        color: red;      				\
    }                       			\
                            			\
    .scammer_btn.action:hover {    		\
        color: red;         			\
    }                       			\
                            			\
    #scammer_num_status {   			\
        color: orange;      			\
    }                       			\
                            			\
    .hasOffered {           			\
        color: orange;      			\
    }                       			\
    ');



$('.sectionText').append("<div id='SIC'>\
<a id='scammer_btn_ignore' class='scammer_btn action'>Ignore red-marked profiles</a>\
&nbsp;&nbsp;|&nbsp;&nbsp;<a id='scammer_btn_block'  class='scammer_btn action'>Block red-marked profiles</a>\
<br/><br/><a id='scammer_btn_inv'  class='scammer_btn setting "+ (a_Settings.inv ? "on" : "off") +"'>CSGO private inventory checkup: "+ (a_Settings.inv ? "ON" : "OFF") + "</a>&nbsp;\
&nbsp;&nbsp;|&nbsp;&nbsp;<a id='scammer_btn_level'  class='scammer_btn setting "+ (a_Settings.lvl ? "on" : "off") +"'>Exclude above level 10: "+ (a_Settings.lvl ? "ON" : "OFF") + "</a>&nbsp;\
</div>");

$('.profile_small_header_text').append("<div id='scammer_num_status'></div>");


var isDone = false; // Is true when all lookups are done

$('.scammer_btn.action').click(function() {
    var btn_type = this.id;
    $('.invite_row').each(function() {
        if ($(this).is('.scammer_private, .scammer_nocsgo') && isDone) {
            var profile = $('.acceptDeclineBlock > .linkStandard', this).attr("href").split("( '")[1].split("', ")[0];

            if (btn_type === "scammer_btn_ignore") FriendAccept(profile, 'ignore');
            else if (btn_type === "scammer_btn_block") FriendAccept(profile, 'block');
        }
    });
});

$('.scammer_btn.setting').click(function() {
	var isOn = $(this).hasClass("on") ? true : false;
	
	isOn ? $(this).removeClass("on").addClass("off") : $(this).removeClass("off").addClass("on");
	
	switch (this.id) {
		case "scammer_btn_inv":
			isOn ? $(this).text("Private CSGO inv checkup: OFF") : $(this).text("Private CSGO inv checkup: ON");
			a_Settings.inv = !isOn;
			break;
		case "scammer_btn_level":
			isOn ? $(this).text("Exclude above level 10: OFF") : $(this).text("Exclude above level 10: ON");
			a_Settings.lvl = !isOn;
			break;
		default:
			break;
	}
});


var _url = "http://steamcommunity.com/profiles/";

var profiles = [];
$('.invite_row').each(function() {
    var element = $(this);
    var name = $('a.linkTitle', this);
    var profile = $('.acceptDeclineBlock > .linkStandard', this).attr("href").split("( '")[1].split("', ")[0];
	var level = $('.friendPlayerLevelNum', this).text();
    profiles.push([element, name, profile, level]);
});


var numProcessed = -1;
addNumProcessed();
for (var i = 0; i < profiles.length; i++) {
    var profileid = profiles[i][2];
	
    if (profileid in a_Cache) {
        console.log(a_Cache);
        console.log(a_Cache[profileid]);
        switch(a_Cache[profileid]) {
            case "private":
                $(profiles[i][1]).prepend("<span class='scammer_warning'>Private</span> ");
                $(profiles[i][0]).addClass("scammer_private");
                break;
            case "nocsgo":
                $(profiles[i][1]).prepend("<span class='scammer_warning'>No CSGO INV</span> ");
                $(profiles[i][0]).addClass("scammer_nocsgo");
                break;
            default:
                break;
        }
        addNumProcessed();
        continue;
    }
	else if (profiles[i][3] > 10) {
		addNumProcessed(profiles[n][2], "clean");
		continue;
	}
    GM_xmlhttpRequest({
        method: "GET",
        url: _url + profileid,
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        },
        onload: function(k) {
            return function(responseData) {
                var dom = (new DOMParser()).parseFromString(responseData.responseText, "text/html");
                var isPrivate = $('.profile_private_info', dom).length > 0 ? true : false;

                if (isPrivate) {
                    $(profiles[k][1]).prepend("<span class='scammer_warning'>Private</span> ");
                    $(profiles[k][0]).addClass("scammer_private");
                    addNumProcessed(profiles[k][2], "private");
                }
                else if (a_Settings.inv) {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: _url + profiles[k][2] + "/inventory",
                        headers: {
                            "X-Requested-With": "XMLHttpRequest"
                        },
                        onload: function(n) {
                            return function(responseData) {
                                var dom = (new DOMParser()).parseFromString(responseData.responseText, "text/html");
                                var ownsCSGO = $('a#inventory_link_730', dom).length > 0 ? true : false;

                                if (!ownsCSGO) {
                                    $(profiles[n][1]).prepend("<span class='scammer_warning'>No CSGO INV</span> ");
                                    $(profiles[n][0]).addClass("scammer_nocsgo");
                                    addNumProcessed(profiles[n][2], "nocsgo");
                                }
                                else {
                                    $(profiles[n][0]).addClass("scammer_clean");
                                    addNumProcessed(profiles[n][2], "clean");
                                }
                            }
                        }(k)
                    });
                }
            }
        }(i)
    });
}


function addNumProcessed(profileid, type) {
    numProcessed++;

    if (profileid && type) a_Cache[profileid] = type;

    var targetProcessed = profiles.length;
    if (numProcessed >= targetProcessed) {
        $('#scammer_num_status').text("All information gathered");
        isDone = true;
        setTimeout(function() { $('#scammer_num_status').hide(); }, 2000);
		GM_setValue("a_Cache", a_Cache);
    }
    else {
        $('#scammer_num_status').text("Gathering profile information. Progress: "+ numProcessed +"/"+ targetProcessed);
    }
}
