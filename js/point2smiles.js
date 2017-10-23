
 //这个函数把所有的输入点转化为smiles 分子字符串表达式
 //在该函数前，应该有preprocess过程

 function pointToSmiles(matrix,oxygen){
    var len = matrix.length;
    // construct vertices and initialization
    var nodes=[];
    for (var i= 0; i < len; i++){
        nodes[i] = new Node(i);

        // put each vertices neighbours into array
        for (var j = 0; j<len; j++){
            if (matrix[i][j]>0){
                nodes[i].neighbour.push(j);
            }
        }
        console.log("node"+i+":"+nodes[i].data+" "+nodes[i].neighbour);
    }
    //nodes[2].neighbour = nodes[2].neighbour.deleteElem(1);
    //console.log("node"+2+":"+nodes[2].data+" "+nodes[2].neighbour);

    //pick a source node
    var min = Infinity;
    var s = 0;
    for (var i= 0; i < len; i++){
        var sum = 0;
        for (var j = 0; j<len; j++){
            sum+= matrix[i][j];

        }
        if (min > sum){
            min = sum;
            s = i;
        }
    }
    console.log("source "+s);

    // call DFS to get traverse records formula information and cycle information
    var d=0;
    var traverse = [];
    var cycle = [];
    DFS(nodes,nodes[s],d,traverse,cycle);
    console.log("traverse: ",traverse);
    console.log("cycle: ",cycle);

    var smiles = getSMILES(traverse,cycle,matrix,oxygen);
    console.log('SMILES: ',smiles);
    return smiles;
 }


function isOxygen(p,oxygen){
    if (oxygen != null){
        for (var i=0; i<oxygen.length;i++){
            if(p == oxygen[i]){
                return 1;
            }
        }
    }
    return 0;
}



function getSMILES(traverse,cycle,matrix,oxygen){
 	var i= traverse.length-1;
 	while(i>=0){
 		var c = traverse[i];
 		var j = i-1;
 		while(j>=0){
 			if(traverse[j]==traverse[i]){ 
 				//console.log(j,i);
 				var sub = traverse.splice(i+1);
 				//console.log(sub);
 				traverse.pop();
 				if(sub.length!=0){
 					traverse.splice(j+1,0,'(');
 					for (var k=0;k<sub.length;k++){
 						
 						traverse.splice(j+k+2,0,sub[k]);
 						
 					}
 					traverse.splice(j+k+2,0,')');
 				}
 				
 			}
 			j--;
 		}
 		i --;
 	}
 	//console.log('sub chain tra')
    //console.log(traverse);
 	for (var i = 0; i < traverse.length-1;i++){
 		var c1 = traverse[i];
 		var c2 = traverse[i+1];
 		if(typeof c1 == 'number' && typeof c2 =='number'){
 			if(matrix[c1][c2]==2){
 				traverse.splice(i+1,0,'=');
 			}
 			if(matrix[c1][c2]==3){
 				traverse.splice(i+1,0,'%23');
 			}
 		}

 	}


 	for(var i=0;i<cycle.length;i+=2){
 		var c1 = cycle[i][0];
 		var c2 = cycle[i][1];
 		var p1 = traverse.indexOf(c1);
 		var p2 = traverse.indexOf(c2);
 		if(p1!=-1 && p2!=-1){
 			traverse.splice(p1+1,0,i.toString());
 			p2 = traverse.indexOf(c2);
 			traverse.splice(p2+1,0,i.toString());
 		}

 	}
    var smiles = '';
    for(var i =0; i < traverse.length;i++){
    	if(typeof traverse[i] == 'number'  ){
    	    if(isOxygen(traverse[i],oxygen)){
    	        smiles += 'O';
    	    }
    	    else {
    		    smiles += 'C';
    	    }
    	}
    	else{
    		smiles += traverse[i];
    	}
    }
        
    return smiles;        

 }


 // parameters are sets of vertices, source node, distance(not used at last), traverse-of-formula(in array), cycles(in array)
 function DFS(nodes, u, d, traverse,cycle){

    u.color = "grey";

    //console.log("u: "+u.data);
    d++;
    u.distance = d;
    //console.log("u.distance:"+u.distance);



    for (var i =0; i<u.neighbour.length;i++){

        //console.log("u+neighbour:"+u.data);

        // get an array of vertices whose child is being checked
        if (u.data != traverse[traverse.length-1]){
            traverse.push(u.data);
        }


        if (nodes[u.neighbour[i]].color == "white"){

            nodes[u.neighbour[i]].parent = u;

            // recursivly call DFS
            DFS(nodes,nodes[u.neighbour[i]],d,traverse,cycle);

        }
        // meet a cycle
        else
        {   // condition of meet a cycle(source node was involved)
            if (u.parent==null && nodes[u.neighbour[i]].color == "grey" ){
                //console.log("meet a ring of "+ring);
                console.log(u.data+" "+u.neighbour[i]+"form a ring");
                //var ring = u.distance-nodes[i].distance;

                var add = [u.data,u.neighbour[i]];
                add2cycle(cycle,add);


            }
            // condition of meet a cycle(source node was not involved)
            else if(nodes[u.neighbour[i]].color == "grey" && u.neighbour[i] != u.parent.data){
                //console.log("meet a ring of "+ring);
                console.log(u.data+" "+u.neighbour[i]+"form a ring");
                //var ring = u.distance-nodes[i].distance;

                var add = [u.data,u.neighbour[i]];
                add2cycle(cycle,add);
            }


        }

    }



 }

 function add2cycle(cycle,add){
 	if(cycle.length==0){
 		cycle.push(add);
 	}
 	else{
 		for (var i =0; i<cycle.length-1;i++){
 			var a = cycle[i];
 			var b = cycle[i+1];
 			if((a==add[0] && b==add[1]) || (a==add[1] && b==add[0])) {
 				var z = 0;
 			}
 			else{
 				cycle.push(add);
 			}

 		}


 	}

 }

 function Node(data) {
    this.data = data;
    this.color = "white";
    this.parent = null;
    this.neighbour = [];
    this.distance = 0; 
}





