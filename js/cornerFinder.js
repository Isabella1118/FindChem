    function point(x,y,time){
      this.x = x;
      this.y = y;
      this.time = time;
      function getX(){
          return this.x;
      }
      function getY(){
          return this.y;
      }
      function getTime(){
          return this.time;
      }
    }
    
    function pathDistance(points,a,b){
		var d = 0;
		for (var i = a; i< b; i++){
			d = d + distance(points,i,i+1);

		}
		return d; 
	}
	
	function distance(points,a,b){
		//console.log(points.length,a,b);
		var x = points[b].x - points[a].x;
		var y = points[b].y - points[a].y;
		return Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
	}
	
	function resample(points,S){
		var D = 0;
		var resampled = [points[0]];
		var j = 1;
		var original = {};
		original[0] = 0;
		for (var i = 1; i<points.length; i++){
			//console.log("reample");
			var d = distance(points, i-1, i);
			
			if (D+d >= S){
				var x = points[i-1].x + ((S-D)/d)*(points[i].x - points[i-1].x);
				var y = points[i-1].y + ((S-D)/d)*(points[i].y - points[i-1].y);
				var p = new point(x,y,0);
				resampled.push(p);
				points.splice(i,0,p);
				original[j] = i;
				//console.log(j,i,original[j]);
				j = j+1;
				D = 0;
				
				
			}
			else {
				D = D + d;
			}
			
		}
		return [resampled,original];
		
	}
	
	function spacing(points){
		
		var maxX = 0, maxY = 0, minX = Infinity, minY = Infinity;
		for (var i = 0; i< points.length; i++){
			
			
			if ( points[i].x < minX) minX = points[i].x;
			
			if ( points[i].y < minY) minY = points[i].y;

			if ( points[i].x > maxX) maxX = points[i].x;
			
			if ( points[i].y > maxY) maxY = points[i].y;	
		}
		var diagonal = Math.sqrt(Math.pow(maxX-minX,2)+Math.pow(maxY-minY,2));
		return diagonal/40;
	}
	
	function getCorners(points){
		//console.log(points.length);
		var corners = [];
		corners.push(0);
		var W = 3;
		var straws={};
		var value = [];
		for (var i = W; i< points.length-W; i++){
			//console.log("straw",i);
			straws[i]= distance(points, i-W, i+W);
			value.push(straws[i]);
		} 
		//console.log(straws);
		var t = median(value) * 0.9;
		//console.log(t);
		for (var i = W; i< points.length-W; i++){
			if (straws[i] < t){
				var min = Infinity;
				var minIndex = i;
				while ((i < points.length-W) & (straws[i] < t)){
					if (straws[i] < min){
						min = straws[i];
						minIndex = i;
					}
					i = i + 1;
				}
				//console.log(i);
				// don't make the point a corner if it's too close to the previous one
				if (minIndex-corners[corners.length-1]>5){
					corners.push(minIndex);		
				}
						
			}		
		}
		corners.push(points.length-1);
		//console.log("corners",corners);
		corners = postProcessCorners(points,corners, straws);
		return corners;
	}
	
	// get the medain of an array
	function median(values) {

		values.sort();

	    var half = Math.floor(values.length/2);

	    if(values.length % 2)
	        return values[half];
	    else
	        return (values[half-1] + values[half]) / 2.0;
	}
	
	function postProcessCorners(points,corners, straws){
		while(true){
			var cont = true; 
			for (var i = 1; i< corners.length;i++){
				var c1 = corners[i-1];
				var c2 = corners[i];
				if (!isLine(points,c1,c2)){
					if ((c1>=3) & (c2<= points.length-3)){
						var newCorner = halfWayCorner(straws,c1,c2);
						//console.log("newCorner",newCorner,"c2",c2);
						if (newCorner != c1 & newCorner!=c2 ) {
							corners.splice(i,0,newCorner);
							cont = false;
						}
						
					//	console.log("newCorner",newCorner);
					//  console.log(corners);
					}			
				}
			}
			if (cont == true) break;
		}
			for (var i =1; i<corners.length-1; i++){
				var c1 = corners[i-1];
				var c2 = corners[i+1];
				if (isLine(points,c1,c2)){
					corners.splice(i,1);
					//console.log(i);
					//console.log(corners);
					i = i -1;
				}
			}
			return corners;
		
		
	}
	
	function isLine(points, a, b){
		//console.log("isLine",a,b);
		var threshold = 0.9;
		//var x = distance(points,a,b);
		//console.log(x);
		var x = distance(points,a,b);
		var y = pathDistance(points,a,b);  
		if (x/y > threshold){
			return true;
		}
		else{
			//console.log(x,y);
			//console.log("false");
			return false;
		}
			
	}
	
	function halfWayCorner(straws,a,b){
		var quarter = Math.floor((b-a)/4);
		//console.log("quarter",quarter);
		var min = Infinity;
		for (var i = a+quarter; i<= b-quarter;i++){
			if (straws[i] < min){
				min = straws[i];
				var minIndex = i;
			}
		}
		//console.log("insert",a,b,minIndex);
		return minIndex;
	}

	