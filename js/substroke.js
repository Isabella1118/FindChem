	// get multistrokes from input points
	function stroke(points){
		console.log("enter stroke function");
		console.log("stroke fun points size: "+points.length);
		// to store the list of strokes,each stroke is a list of points
		var stroke = [];
		// temporary store points for each stroke, then push to stroke[]
		var strokepoints = [];
		// to get time differece
		var previous = 0;
		for (var i = 0; i < points.length; i++){
			if (previous != 0){
				var diff = points[i].time - previous;
				if (diff < 500){
					// push points to strokepoints if no big gap found
					strokepoints.push(points[i]);
				}
				else{
					// if gap found, push previous strokepoints as a stroke to stroke[]
					stroke.push(strokepoints);
					console.log("stroke size iterate: "+ stroke.length);

					console.log("change");

					// empty strokepoints
					strokepoints = [];
					// add the first point of the next stroke to a new strokepoints set
					strokepoints.push(points[i]);
				}
			}
			previous = points[i].time;

		}
		// add the last stroke
		stroke.push(strokepoints);
		console.log("stroke size iterate: "+ stroke.length);
		//console.log(stroke);
		return stroke;
	}

	function find_substroke(stroke){
		console.log("enter substroke function");


		// iterate each strokes, find corners, get substrokes
		var substroke = [];

        var oxygen = [];

		for (var i = 0; i < stroke.length; i++){
			var points = stroke[i];

            // parameter for judging whether it's oxygen
            var startend = distance(points, 0, points.length-1);
            var diagonal = spacing(points)*40;

            if (startend<20 && diagonal<100){

                // an oxygen, store its center point in array
                var maxX = 0, maxY = 0, minX = Infinity, minY = Infinity;
                for (var j = 0; j< points.length; j++){

                    if ( points[j].x < minX) minX = points[j].x;

                    if ( points[j].y < minY) minY = points[j].y;

                    if ( points[j].x > maxX) maxX = points[j].x;

                    if ( points[j].y > maxY) maxY = points[j].y;
                }
                var x = (maxX+minX)/2;
                var y = (maxY+minY)/2;
                var p = new point(x,y,0);
                oxygen.push(p);

            }
            else{

                // not oxygen, get its substroke
                // get spacing
                var s = spacing(points);
                // get resamples
                var transfer = resample(points,s);
                var resamples = transfer[0];
                // get original points for corners
                var originals = transfer[1];

                var corners = getCorners(resamples);


                for (var a = 0; a < corners.length-1;a++){
                    var points = stroke[i];
                    var newPoints = [];
                    //console.log(originals[corners[i]]);
                    for (var j = originals[corners[a]]; j <= originals[corners[a+1]]; j++){

                        newPoints.push(points[j]);

                        //for (var j = corners[a]; j <= corners[a+1]; j++){

                        //newPoints.push(resamples[j]);

                    }
                    substroke.push(newPoints);
                }

            }


		}
		return [substroke,oxygen];

	}

	function findNode(endPoints,minDis){
		//loop through all end points
		var nodes=[];
     	for (var j = 0; j < endPoints.length; j++){
 			var node0 = [endPoints[j]];
      		var p1 = endPoints[j];
      		// console.log("**********j = "+j);
      		//do not compare with self
      		for (var k = 0; k < endPoints.length; k++){
      			// console.log("**********k = "+k);
       			// if(k!=j){
       			if(k!=j){
       				var p2 = endPoints[k];
       				if (close(p1,p2,minDis)){
       					console.log("---------node0 length = "+node0.length);
        				node0.push(p2);
        				endPoints.splice(k,1);
        				k--;
       				}
       			}

      		}
      		//need start and end point to be node
      		if (node0.length >= 1){
       			nodes.push(node0);
       			// console.log("node0 i length = "+node0.length);
      		}
      		console.log("nodes length = "+nodes.length);
     	}
     	return nodes;
	}

	//function close has threshold to be changed: dis
	function close(p1,p2,min){
		var x1 = p1.x;
		var y1 = p1.y;
		var x2 = p2.x;
		var y2 = p2.y;
		var dis = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
		console.log("minDis = "+min);
		var rst = false;
		if (dis <= min){
			console.log("dis<=21: (x1-x2) = "+(x1-x2)+" (y1-y2) "+(y1-y2));
			rst = true;
		}
		return rst;
	}

	function adjMatrix(nodes,endPoints){
		//build adj matrix
		var nodeM = [];
		for (var i = 0; i < nodes.length; i++) {
			var nodeN = [];
			for(var j = 0;j < nodes.length;j++){
				nodeN.push(0);
			}
  			nodeM.push(nodeN);
		}

		for(var i=0;i<nodes.length;i++){
			for(var k=0;2*k<endPoints.length;k++){
				if(contains(endPoints[2*k],nodes[i]))
					for(var j=0;j<nodes.length;j++){
						if(j!=i && contains(endPoints[2*k+1],nodes[j])){
							//store substroke k
							nodeM[i][j]++;
							nodeM[j][i]++;
						}
					}
			}
		}

		//print nodeM
		console.log("nodeM: = "+nodeM.length);
		for(var i=0;i<nodeM.length;i++){
			console.log(nodeM[i]+";");
		}
		return nodeM;
	}

	//given nodes point list and oxygen point list
	//figure out which node is oxygen
	//return them in the oxygenList
	function oxList(comb,min){
		var nodes = comb[0];
		var oxygen = comb[1];
		var oList = [];
		for(var i=0;i<nodes.length;i++){
			for(var j=0;j<oxygen.length;j++){
				if(close(nodes[i][0],oxygen[j],min)){
					oList.push(i);
				}
			}
		}
		console.log("oxygenList: = "+oList.length);
		for(var i=0;i<oList.length;i++){
			console.log(oList[i]+";");
		}
		return oList;
	}

	function contains(value,array){
    	var rst = false;
    	for(var i=0;i<array.length;i++){
    		// console.log("array[i] x y = "+array[i].getX()+" "+array[i].getY());
     	  	if(array[i]===value){
     	  		// console.log("*******same to array[i] x y! value x y = "+value.getX()+" "+value.getY());
     	  		rst = true;
     	  	}
     	  	// else{
     	  	// 	console.log("*******different from array[i] x y! value x y = "+value.getX()+" "+value.getY());
     	  	// }
    	}

    	return rst;
	}
	function getOxygenIndex(oxygenPoints,nodes){
		var oxygen = [];
		for (var i=0;i < oxygenPoints;i++){
			
		}
		return oxygen;
		
	}