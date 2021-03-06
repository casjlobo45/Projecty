$(document).ready(function(){
  $.ajax({
    url: "http://mtgjson.com/json/AllSetsArray.json",
    dataType: "json",
    success: function(data){
      var name
      var date
      var year
      for (var i = 0; i<data.length; i++){
        if (data[i].cards.length>15&&data[i].name!=="Vanguard"&&data[i].name!=="Time Spiral \"Timeshifted\""&&data[i].name!=="Unglued"){
        name = data[i].name;
        date = data[i].releaseDate
        year = date.substring(0, 4)
        $("#cardSet").append('<option value="'+name+'">'+name+' ('+year+')</select>')
        }
      }
    },
    error: function(){
      alert("We are having trouble accessing the MTG json file.");
    }
  });
  changeSet("All Cards");
});

function changeSet() {
  var set = $("#cardSet").val();
    $("#legend").empty();
    $("#chart").empty();
    $("#set").empty();
    $("#set").append('<h3 style="color:#ffffff" class="big-words">'+set+'</h3>');
    $("#chart").append('<div id="explanation" style="visibility: hidden;"><span id="percentage"></span><br/>of Cards have all of these attributes</div>')
    $("#message").fadeOut("slow")
  // Dimensions of sunburst.
  var width = 750;
  var height = 600;
  var radius = Math.min(width, height) / 2;

  // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
  var b = {
    w: 75, h: 30, s: 3, t: 10
  };
  //"Other":"761CCA",
  // Mapping of step names to colors.
  var colors = {
    "Black": "#000000",
    "Blue": "#0083C7",
    "Green": "#089D49",
    "White": "#F2F5A9",
    "Red": "#CE1127",
    "Colorless": "#ACACAC",
    "Creature":"#4B0082",
    "Enchantment":"#800080",
    "Instant":"#8B008B",
    "Land":"#9932CC",
    "Artifact":"#9400D3",
    "Sorcery":"#8A2BE2",
    "CMC:0 to 2":"#B45F04",
    "CMC:3 to 6":"#DF7401",
    "CMC:7 to 9":"#FF8000",
    "CMC:10+":"#FE9A2E"

  };

  // Total size of all segments; we set this later, after loading the data.
  var totalSize = 0;

  var vis = d3.select("#chart").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .append("svg:g")
      .attr("id", "container")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var partition = d3.layout.partition()
      .size([2 * Math.PI, radius * radius])
      .value(function(d) { return d.size; });

  var arc = d3.svg.arc()
      .startAngle(function(d) { return d.x; })
      .endAngle(function(d) { return d.x + d.dx; })
      .innerRadius(function(d) { return Math.sqrt(d.y); })
      .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

  // This function would pull in the csv file but this javascript does not need it because of the ajax call.
  // Use d3.text and d3.csv.parseRows so that we do not need to have a header
  // row, and can receive the csv as an array of arrays.
  //d3.text("cards.csv", function(text) {
    //var csv = d3.csv.parseRows(text);
    //getSizes(csv)
    //console.log(csv);
    //var json = buildHierarchy(csv);
    //console.log(json);
    //createVisualization(json);
  //});

  // This function creates the data and then performs all the necessary functions to generate the visual for that data.
  function getSizes(set) {
      function mapColor(color) {
        if (color==="B"){
          return "Black"
        } else if (color==="U"){
          return "Blue"
        } else if (color==="R"){
          return "Red"
        } else if (color==="G"){
          return "Green"
        } else if (color==="W"){
          return "White"
        } else {return "Colorless"}
      }
      function mapCMC(cmc){
        if (cmc>9){
          return "CMC:10+"
        } else if (cmc<=9&&cmc>6){
          return "CMC:7 to 9"
        } else if (cmc<=6&&cmc>2){
          return "CMC:3 to 6"
        } else {return "CMC:0 to 2"}
      }
      function isItemInArray(array, string) {
        for (var i = 0; i < array.length; i++) {
          if (array[i][0] === string) {
              return true;   // Found it
            }
        }
        return false;   // Not found
      }
      if (set!=="All Cards"){
       $.ajax({
         url: "http://mtgjson.com/json/AllSetsArray.json",
         dataType: "json",
         success: function (data){
           var array = [["Black-Creature-CMC:0-2",0]];
           var color;
           var type;
           var cmc;
           var string;
           var size = 1;
           for (var i=0; i<data.length; i++){
             if(set === data[i].name){
              var numCards = data[i].cards.length
              var rarity=[]
              var cardRarity
              for (var j = 0; j<data[i].cards.length; j++){
                 if(data[i].cards[j].types[0]==="Land"){
                   if (data[i].cards[j].colorIdentity!==undefined){
                        color = data[i].cards[j].colorIdentity[0];
                     } else {color = "Colorless"}
                   color = mapColor(color);
                   type = "Land";
                   cardRarity = data[i].cards[j].rarity;
                   if (isItemInArray(rarity, cardRarity)===false){
                     rarity.push([cardRarity, size])
                   } else {
                    for (var l = 0; l<rarity.length; l++){
                      if (rarity[l][0]===cardRarity){
                        rarity[l][1]++
                      }else {continue}
                    }
                   }
                   string = color+"-"+type;
                   if (isItemInArray(array, string)===false){
                     array.push([string, size])
                   } else {
                    for (var k = 0; k<array.length; k++){
                      if (array[k][0]===string){
                        array[k][1]++
                      }else {continue}
                    }
                   }
                } else if (data[i].cards[j].types[0]==="Creature"||data[i].cards[j].types[0]==="Enchantment"||data[i].cards[j].types[0]==="Instant"||data[i].cards[j].types[0]==="Artifact"||data[i].cards[j].types[0]==="Sorcery"){
                     if (data[i].cards[j].colorIdentity!==undefined){
                        color = data[i].cards[j].colorIdentity[0];
                     } else {color = "Colorless"}
                   color = mapColor(color);
                   type = data[i].cards[j].types[0];
                   cmc = data[i].cards[j].cmc;
                   cmc = mapCMC(cmc);
                   cardRarity = data[i].cards[j].rarity;
                   if (isItemInArray(rarity, cardRarity)===false){
                     rarity.push([cardRarity, size])
                   } else {
                    for (var l = 0; l<rarity.length; l++){
                      if (rarity[l][0]===cardRarity){
                        rarity[l][1]++
                      }else {continue}
                    }
                   }
                   string = color+"-"+type+"-"+cmc;
                   if (isItemInArray(array, string)===false){
                     array.push([string, size])
                   } else {
                    for (var k = 0; k<array.length; k++){
                      if (array[k][0]===string){
                        array[k][1]++
                      } else {continue}
                    }
                   }
                }
             }
               break
            } else {continue}
           }
           var stringSize
           for (var m = 0; m<array.length; m++){
              stringSize = array[m][1];
              stringSize = stringSize.toString();
              array[m][1] = stringSize;
           }
           var json = buildHierarchy(array);
           createVisualization(json);
           var message = "<h4 class='big-words'><p style='color:black'>This set has a total of "+numCards+" cards.<p style='color:black'>This set contains:<br>"
           for (var c = 0; c<rarity.length; c++){
             if (rarity[c][1]>1){
               message = message + rarity[c][1]+" "+rarity[c][0]+" cards<br>"
             } else {
               message = message + rarity[c][1]+" "+rarity[c][0]+" card<br>"
             }
           }
           message = message + "</h4>"
           $("#message").html(message).fadeIn("slow")
         },
         error: function () {
           alert("We are having trouble accessing the MTG json file.");
         }
       })
      } else if (set==="All Cards"){
        $.ajax({
         url: "http://mtgjson.com/json/AllCards.json",
         dataType: "json",
         success: function (data){
           var cardArray = $.map(data, function(el) { return el });
           var array = [["Black-Creature-CMC:0-2",0]];
           var color;
           var type;
           var cmc;
           var string;
           var size = 0;
           for (var z=0; z<cardArray.length; z++){
             if(cardArray[z].types!==undefined){
              if(cardArray[z].types[0]==="Land"){
                if (cardArray[z].colorIdentity!==undefined){
                     color = cardArray[z].colorIdentity[0];
                  } else {color = "Colorless"}
                color = mapColor(color);
                type = "Land";
                string = color+"-"+type;
                if (isItemInArray(array, string)===false){
                  array.push([string, size])
                } else {
                 for (var y = 0; y<array.length; y++){
                   if (array[y][0]===string){
                     array[y][1]++
                   }else {continue}
                 }
                }
             } else if (cardArray[z].types[0]==="Creature"||cardArray[z].types[0]==="Enchantment"||cardArray[z].types[0]==="Instant"||cardArray[z].types[0]==="Artifact"||cardArray[z].types[0]==="Sorcery"){
                  if (cardArray[z].colorIdentity!==undefined){
                     color = cardArray[z].colorIdentity[0];
                  } else {color = "Colorless"}
                color = mapColor(color);
                type = cardArray[z].types[0];
                cmc = cardArray[z].cmc;
                cmc = mapCMC(cmc);
                string = color+"-"+type+"-"+cmc;
                if (isItemInArray(array, string)===false){
                  array.push([string, size])
                } else {
                 for (var x = 0; x<array.length; x++){
                   if (array[x][0]===string){
                     array[x][1]++
                   } else {continue}
                 }
                }
             }
             }
           }
           var stringSize
           for (var m = 0; m<array.length; m++){
              stringSize = array[m][1];
              stringSize = stringSize.toString();
              array[m][1] = stringSize;
           }
           $("#message").slideUp().empty()
           var json = buildHierarchy(array);
           createVisualization(json);
          },
         error: function () {
           alert("We are having trouble accessing the MTG json file.");
         }
       })

      }
  };
  getSizes(set);


  // Main function to draw and set up the visualization, once we have the data.
  function createVisualization(json) {

    // Basic setup of page elements.
    initializeBreadcrumbTrail();
    drawLegend();
    d3.select("#togglelegend").on("click", toggleLegend);

    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    vis.append("svg:circle")
        .attr("r", radius)
        .style("opacity", 0);

    // For efficiency, filter nodes to keep only those large enough to see.
    var nodes = partition.nodes(json)
        .filter(function(d) {
        return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
        });

    var path = vis.data([json]).selectAll("path")
        .data(nodes)
        .enter().append("svg:path")
        .attr("display", function(d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", function(d) { return colors[d.name]; })
        .style("opacity", 1)
        .on("mouseover", mouseover);

    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave);

    // Get total size of the tree = value of root node from partition.
    totalSize = path.node().__data__.value;
   };

  // Fade all but the current sequence, and show it in the breadcrumb trail.
  function mouseover(d) {

    var percentage = (100 * d.value / totalSize).toPrecision(3);
    var percentageString = percentage + "%";
    if (percentage < 0.1) {
      percentageString = "< 0.1%";
    }

    d3.select("#percentage")
        .text(percentageString);

    d3.select("#explanation")
        .style("visibility", "");

    var sequenceArray = getAncestors(d);
    updateBreadcrumbs(sequenceArray, percentageString);

    // Fade all the segments.
    d3.selectAll("path")
        .style("opacity", 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    vis.selectAll("path")
        .filter(function(node) {
                  return (sequenceArray.indexOf(node) >= 0);
                })
        .style("opacity", 1);
  }

  // Restore everything to full opacity when moving off the visualization.
  function mouseleave(d) {

    // Hide the breadcrumb trail
    d3.select("#trail")
        .style("visibility", "hidden");

    // Deactivate all segments during transition.
    d3.selectAll("path").on("mouseover", null);

    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll("path")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .each("end", function() {
                d3.select(this).on("mouseover", mouseover);
              });

    d3.select("#explanation")
        .style("visibility", "hidden");
  }

  // Given a node in a partition layout, return an array of all of its ancestor
  // nodes, highest first, but excluding the root.
  function getAncestors(node) {
    var path = [];
    var current = node;
    while (current.parent) {
      path.unshift(current);
      current = current.parent;
    }
    return path;
  }

  function initializeBreadcrumbTrail() {
    // Add the svg area.
    var trail = d3.select("#sequence").append("svg:svg")
        .attr("width", width)
        .attr("height", 50)
        .attr("id", "trail");
    // Add the label at the end, for the percentage.
    trail.append("svg:text")
      .attr("id", "endlabel")
      .style("fill", "#000");
  }

  // Generate a string that describes the points of a breadcrumb polygon.
  function breadcrumbPoints(d, i) {
    var points = [];
    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h / 2));
    points.push(b.w + "," + b.h);
    points.push("0," + b.h);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
      points.push(b.t + "," + (b.h / 2));
    }
    return points.join(" ");
  }

  // Update the breadcrumb trail to show the current sequence and percentage.
  function updateBreadcrumbs(nodeArray, percentageString) {

    // Data join; key function combines name and depth (= position in sequence).
    var g = d3.select("#trail")
        .selectAll("g")
        .data(nodeArray, function(d) { return d.name + d.depth; });

    // Add breadcrumb and label for entering nodes.
    var entering = g.enter().append("svg:g");

    entering.append("svg:polygon")
        .attr("points", breadcrumbPoints)
        .style("fill", function(d) { return colors[d.name]; });

    entering.append("svg:text")
        .attr("x", (b.w + b.t) / 2)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.name; });

    // Set position for entering and updating nodes.
    g.attr("transform", function(d, i) {
      return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    // Remove exiting nodes.
    g.exit().remove();

    // Now move and update the percentage at the end.
    d3.select("#trail").select("#endlabel")
        .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(percentageString);

    // Make the breadcrumb trail visible, if it's hidden.
    d3.select("#trail")
        .style("visibility", "");

  }

  function drawLegend() {

    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    var li = {
      w: 75, h: 30, s: 3, r: 3
    };

    var legend = d3.select("#legend").append("svg:svg")
        .attr("width", li.w)
        .attr("height", d3.keys(colors).length * (li.h + li.s));

    var g = legend.selectAll("g")
        .data(d3.entries(colors))
        .enter().append("svg:g")
        .attr("transform", function(d, i) {
                return "translate(0," + i * (li.h + li.s) + ")";
             });

    g.append("svg:rect")
        .attr("rx", li.r)
        .attr("ry", li.r)
        .attr("width", li.w)
        .attr("height", li.h)
        .style("fill", function(d) { return d.value; });

    g.append("svg:text")
        .attr("x", li.w / 2)
        .attr("y", li.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.key; });
  }

  function toggleLegend() {
    var legend = d3.select("#legend");
    if (legend.style("visibility") == "hidden") {
      legend.style("visibility", "");
    } else {
      legend.style("visibility", "hidden");
    }
  }

  // Take a 2-column CSV and transform it into a hierarchical structure suitable
  // for a partition layout. The first column is a sequence of step names, from
  // root to leaf, separated by hyphens. The second column is a count of how
  // often that sequence occurred.
  function buildHierarchy(csv) {
    var root = {"name": "root", "children": []};
    for (var i = 0; i < csv.length; i++) {
      var sequence = csv[i][0];
      var size = +csv[i][1];
      if (isNaN(size)) { // e.g. if this is a header row
        continue;
      }
      var parts = sequence.split("-");
      var currentNode = root;
      for (var j = 0; j < parts.length; j++) {
        var children = currentNode["children"];
        var nodeName = parts[j];
        var childNode;
        if (j + 1 < parts.length) {
     // Not yet at the end of the sequence; move down the tree.
   	var foundChild = false;
   	for (var k = 0; k < children.length; k++) {
   	  if (children[k]["name"] == nodeName) {
   	    childNode = children[k];
   	    foundChild = true;
   	    break;
   	  }
   	}
    // If we don't already have a child node for this branch, create it.
   	if (!foundChild) {
   	  childNode = {"name": nodeName, "children": []};
   	  children.push(childNode);
   	}
   	currentNode = childNode;
        } else {
   	// Reached the end of the sequence; create a leaf node.
   	childNode = {"name": nodeName, "size": size};
   	children.push(childNode);
        }
      }
    }
    return root;
  };
}
