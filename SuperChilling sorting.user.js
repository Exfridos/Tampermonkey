// ==UserScript==
// @name         SuperChilling sorting
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Sorting movies by date AND IMDB score
// @author       Exfridos
// @match        http://superchillin.com/rating.php
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

$(document).ready(function() {
    var middleContainer = $("td>table>tbody>tr:eq(1)>td");
    
    middleContainer.prepend("<div class='sortBtn'>Sort by best score AND year (Descending)</div>");
    $(".sortBtn").css({
    	"color": "white",
	    "margin": "64px auto 0 auto",
	    "text-align": "center",
	    "background-color": "orange",
	    "width": "200px",
	    "padding": "4px",
	    "border-radius": "2px",
	    "cursor": "pointer"
    })
    .click(function() {
    	$(this).text("Sorting...\n");

		var moviesContainer = $("td>table>tbody>tr:eq(2)>td");
		var moviesRaw = moviesContainer.html();

		var pattern = /<br><b>(\d.\d)<\/b> - (\d{4}) - .*?<\/a>/g;

		var match = pattern.exec(moviesRaw);

		var movies = [];

		while (match != null) {
			var score = (match[2] + match[1]).replace(".", "");
			movies.push({score: score, html: match[0]});
			match = pattern.exec(moviesRaw);
		}

		sort(movies, "score");

		console.log(movies);

		function sort(arr){
			arr.sort(function(a, b){
				var scoreA = a.score, scoreB = b.score;
				if (scoreA > scoreB) return -1 //sort string ascending
				if (scoreA < scoreB) return 1
				return 0 //default return value (no sorting)
			});            
		}
		moviesContainer.empty();

		$(movies).each(function(k, v) {
			moviesContainer.append(v.html);
		});
	    
	    $(".tippable").mousemove(function(e) {

			$('.balloon').html('<a href="/?' + $(this).attr('id') + '"><img src="http://199.255.139.34/~breakfas/2img/' + $(this).attr('id') + '.jpg" width="214" height"317" alt=""/></a>');
			$('.balloon').css('left', e.pageX + 25).css('top', e.pageY + 25).css('display', 'block');

		});
		$(".tippable").mouseout(function() { 
	        $('.balloon').css('display', 'none');
	    });

	    $(this).text("Sorted\n");
	});
});
