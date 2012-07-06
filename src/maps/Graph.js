// ========================================================================================== //
// GRAPH
var Graph = Class({
	constructor: function() {
	    this.nodes = [];
	},

    generateGraphLayout: function(width, height, dx, dy) {
        //return this;
    },
	

	generateGraph: function(nodeCount, maxEdge) {
		this.populateNodes(nodeCount);
	},

	populateNodes: function(nodeCount) {
		for (var i = 0; i < nodeCount; i++) {
			this.nodes.push(new Node(i));
		}
	},
	
	// Check whether 2 nodes are connected
	isConnected: function(i0, i1) {
		if (this.nodes[i0] === undefined)
			return false;

		return this.nodes[i0].isConnectedTo(this.nodes[i1]);
	},

	debug: function() {
		debug.log("Graph: ", this);
		for (var i = 0; i < this.nodes.length; i++) {
			var str = i + " : ";
			var curNode = this.nodes[i];
			for (var j = 0; j < curNode.links.length; j++) {
				str += curNode.links[j].id + " ";
			}
			
			debug.log(str);
		}
	}
});

// ========================================================================================== //
// BINARY TREE
var BinaryTree = Class(Graph, {
	constructor: function() {
		BinaryTree.$super.call(this);
		this.root = undefined;
	},
	
	computeDepth: function(node) {
		if (node === this.root)
			node.depth = 0;

		for (var i = node.links.length - 1; i >= 0; i--) {
			node.links[i].depth = node.depth + 1;
			this.computeDepth(node.links[i]);
		};
	},
	
	countLeaf: function(node) {
		if (node === undefined)
			return 0;

		if (node.leafCount >= 0)
			return node.leafCount;

		if (node.isLeaf())
			node.leafCount = 1;

		node.leafCount = this.countLeaf(node.leftNode()) + this.countLeaf(node.rightNode());

		return node.leafCount;
	},
	
	makeTreeRightHeavy: function(node){
		var leftNode = node.leftNode();
		var rightNode = node.rightNode();
		
		var left = 0;
		if (leftNode !== undefined) {
			left = leftNode.leafCount;
			this.makeTreeRightHeavy(leftNode);
		}

		var right = 0;
		if (rightNode !== undefined) {
			right = rightNode.leafCount;
			this.makeTreeRightHeavy(rightNode);
		}
		
		// Swap node's children if it's not right-heavy
		if (left > right)
			node.swapChildren();
	},

	populateNodes: function(nodeCount) {
		for (var i = 0; i < nodeCount; i++) {
			this.nodes.push(new BinaryNode(i));
		}
	},

	generateGraph: function(nodeCount) {
		this.populateNodes(nodeCount);
		var maxEdge = 2;
		var t = 0;
		for (var i = 1; i < nodeCount; i++) {
			while (this.nodes[t].isFull() || this.isConnected(t, i)) {
				t = Math.floor(Math.random() * i);
			}
			
			this.nodes[t].addChild(this.nodes[i]);
		}

		this.root = this.nodes[0];
	}
});

// ========================================================================================== //
// NODE
var Node = Class({
	constructor: function(id) {
		this.id = id;
		this.x = 0;
		this.y = 0;
		// size of the node's region
		this.w = 0;
		this.h = 0;

		this.links = [];
	},

	setPosition: function(_x, _y) {
		this.x = _x;
		this.y = _y;
	},

	connectTo: function(node) {
		if (this.isConnectedTo(node))
			return;

		this.links.push(node);
	},

	isConnectedTo: function(node) {
		return (this.links.indexOf(node) > -1);
	}
});

// ========================================================================================== //
// BINARY NODE
var BinaryNode = Class(Node, {
	constructor: function(id) {
		BinaryNode.$super.call(this, id);

		this.leafCount = -1;
		this.depth = -1;
	},

	leftNode: function() {
		return this.links[0];
	},

	rightNode: function() {
		return this.links[1];
	},

	addChild: function(node) {
		if (this.isFull())
			return false;

		this.links.push(node);
	},

	isFull: function() {
		return (this.links.length === 2);
	},

	isLeaf: function() {
		return (this.links.length === 0);
	},

	swapChildren: function() {
		var tmp = this.links[0];
		this.links[0] = this.right[1];
		this.links[1] = tmp;
	},

	invertOffsetX: function() {
		this.x = -this.x;

		if (this.links[0])
			this.links[0].invertOffsetX();
		if (this.links[1])
			this.links[1].invertOffsetX();
	},

	transposeOffset: function() {
		var tmp = this.x;
		this.x = this.y;
		this.y = tmp;

		if (this.links[0])
			this.links[0].transposeOffset();
		if (this.links[1])
			this.links[1].transposeOffset();
	}
});

// ========================================================================================== //
// GRAPH LAYOUT
var GraphLayout = Class({
	constructor: function(graph, nodeSize) {
		this.graph = graph;
		this.nodeSize = (nodeSize === undefined ? 1 : nodeSize);
		// this.nodePos = this.graph.nodePos;
	},

	createLayout: function() {
	}
});


// ========================================================================================== //
// HORIZONTAL VERIZONTAL LAYOUT
var HVLayout = Class(GraphLayout, {
	constructor: function(graph, nodeSize) {
		HVLayout.$super.call(this, graph, nodeSize);
	},
	
	computeNodeSize: function(node) {
		var s = this.nodeSize;
		if (node === undefined)
			return {w: 0, h: 0};
		
		var leftNode = node.leftNode();
		var rightNode = node.rightNode();
			
		// Create layout for left node
		var leftSize = this.computeNodeSize(leftNode);
		// Create layout for right node
		var rightSize = this.computeNodeSize(rightNode);
		
		var layoutSize = {w: 0, h: 0};
		layoutSize.w = Math.max(leftSize.w, s) + rightSize.w;
		layoutSize.h = Math.max(leftSize.h + s, rightSize.h);

		// Change size of current node
		//node.SetSize(layoutSize);
		// Set offset for child nodes
		if (leftNode !== undefined) {
			leftNode.setPosition(0, s);
		}
		// _Put other tree to the right of current node's position
		if (rightNode !== undefined) {
			rightNode.setPosition(Math.max(leftSize.w, s), 0);
		}

		return layoutSize;
	},
	
	computeLayoutPos: function(node) {
		var x0 = node.x;
		var y0 = node.y;

		for (var i = node.links.length - 1; i >= 0; i--) {
			var checkNode = node.links[i];
			checkNode.x += x0;
			checkNode.y += y0;
			
			this.computeLayoutPos(checkNode);
		}
	},

	createLayout: function() {
		this.computeNodeSize(this.graph.root);
		this.computeLayoutPos(this.graph.root);
		// this.graph.nodePos = this.nodePos;
	}
});

// ========================================================================================== //
// RECURSIVE WINDING LAYOUT
var RecursiveWindingLayout = Class(HVLayout, {
	constructor: function(graph, nodeSize) {
		RecursiveWindingLayout.$super.call(this, graph, nodeSize);		
	},
	
	findRightNode: function() {
		var totalNodes = this.graph.nodes.length;
		var limitNodes = Math.sqrt(totalNodes * Math.log(totalNodes));
		var node = this.graph.root;

		var totalLeaf = this.graph.countLeaf(this.graph.root);
		if (totalLeaf < limitNodes)
			return node;
			
		while (node.leafCount > totalLeaf - limitNodes) {
			var rightNode = node.rightNode();
			if (rightNode === undefined || rightNode.leafCount <= totalLeaf - limitNodes)
				break;
				
			node = rightNode;
		}
		return node;
	},
	
	createLayout: function() {
		// Turn the tree into right-heavy tree
		var rootNode = this.graph.root;
		this.graph.makeTreeRightHeavy(rootNode);
		this.graph.countLeaf(rootNode);
		this.graph.computeDepth(rootNode);
		
		var s = this.nodeSize;

		//BinNode* rightNode = root->RightNode();
		var rightNode = this.findRightNode();
		var rlNode = rightNode.leftNode();
		var rrNode = rightNode.rightNode();
		
		// Vertical combine 2 subtrees
		var rlSize = this.computeNodeSize(rlNode);
		var rrSize = this.computeNodeSize(rrNode);
		if (rlNode !== undefined) {
			rlNode.setPosition(s, 0);
		}
		if (rrNode !== undefined) {
			rrNode.setPosition(0, Math.max(rlSize.h, s));
		}

		if (rightNode.depth == 0) {
		}
		else if (rightNode.depth == 1) {
			var leftNode = rootNode.leftNode();
			var leftSize = this.computeNodeSize(leftNode);
			
			if (leftNode !== undefined) {
				this.transposeOffset(leftNode);
				leftNode.setPosition(Math.max(rlSize.w + s, rrSize.w), 0);
			}
			
			rightNode.setPosition(0, s);
		}
		else {
			var node = rootNode;
			var leftNode;
			var size;
			var offset = {x: 0, y: 0};
			var rOffset = {x: 0, y: 0};
			while (node.rightNode() !== rightNode) {
				leftNode = node.leftNode();
				size = this.computeNodeSize(leftNode);
				
				if (leftNode !== undefined)
					leftNode.setPosition(0, s);
					
				if (nodeID !== 0)
					node.setPosition(offset.x, offset.y);

				node = node.rightNode();

				offset.x = Math.max(size.w, s);
				rOffset.y = Math.max(rOffset.y, size.h + s);
			}
			
			// Place T[k-1]
			node.setPosition(offset.x, offset.y);
			leftNode = node.leftNode();
			size = this.computeNodeSize(leftNode);
			if (leftNode !== undefined) {
				leftNode.transposeOffset();
				leftNode.setPosition(s, 0);
			}
			
			// Place T' & T''
			rOffset.y = Math.max(rOffset.y, size.y);
			rightNode.setPosition(rOffset.x, rOffset.y);
			if (rlNode !== undefined)
				rlNode.invertOffsetX();
			if (rrNode !== undefined)
				rrNode.invertOffsetX();
		}

		this.computeLayoutPos(rootNode);
	}
});

// ========================================================================================== //
// GRAPH RENDERER
var GraphRenderer = Class({
	constructor: function(renderer) {
		this.renderer = renderer;
		this.graph = {};

		this.lines = [];
		this.nodes = [];

		this.offsetX = 0;
		this.offsetY = 0;
		this.scale = 1;
		this.nodeSize = 1;

		this.lineColor = 0;
		this.nodeColor = 0;

		this.lineWidth = 1;

		this.nodeRenderer = undefined;
	},

	setGraph: function(graph) {
		if (!graph || this.graph === graph)
			return;

		this.graph = graph;

		this.lines = [];
		this.nodes = [];

		// Process graph
		// Generate node position
		for (var i = 0; i < this.graph.nodes.length; i++) {
			var node = this.graph.nodes[i];
			var p = { x: node.x, y: node.y };
			p.x *= this.scale;
			p.y *= this.scale;
			p.x += this.offsetX;
			p.y += this.offsetY;
			this.nodes.push(p);
		}
		// Generate lines
		for (var i = 0; i < this.graph.nodes.length; i++) {
			var curNode = this.graph.nodes[i];
			var t0 = i;
			for (var j = 0; j < curNode.links.length; j++) {
				var t1 = curNode.links[j].id;

				this.lines.push({p0: this.nodes[t0], p1: this.nodes[t1]});
			}
		}
	},

	draw: function(graph) {
		this.setGraph(graph);

		// Draw all the line
		this.renderer.setColor(this.lineColor);
		this.renderer.setLineWidth(this.lineWidth);
		for (var i = this.lines.length - 1; i >= 0; i--) {
			// this.renderer.drawLine(this.lines[i].p0, this.lines[i].p1);
			this.renderer.drawLine(this.lines[i].p0, this.lines[i].p1);
		};

		// Draw all the nodes
		this.renderer.setColor(this.nodeColor);
		for (var i = this.nodes.length - 1; i >= 0; i--) {
			var p = this.nodes[i];

			if (this.nodeRenderer === undefined)
				this.renderer.drawCircle(p.x, p.y, this.nodeSize, 1);
			else
				this.nodeRenderer.draw(this.renderer, p.x - this.nodeSize, p.y - this.nodeSize, 
										this.nodeSize * 2);
			// this.renderer.drawCircle(p.x, p.y, this.nodeSize * 2, NODE_COLOR);
			// this.renderer.setColor("#000000");
			// this.renderer.drawText(i + "", p.x - 5, p.y + 5);
		};
	}
});

// ========================================================================================== //
// NODE RENDERER
// var NodeRenderer = Class({
// 	constructor: function(render) {
// 		this.render = renderer;
// 	},

// 	draw: function(x0, y0) {

// 	}
// });