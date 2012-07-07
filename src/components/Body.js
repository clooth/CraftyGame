Crafty.c('Body',
{

	TileWidth : 1,
	TileHeight : 1,
	IsStatic : true,
	MovementSpeed : 0.1,
	Faction : Factions.Neutral,

	_world : null,
	_tileX : 0,
	_tileY : 0,
	_moveTo : null,
	_needUpdateSprite : false,

	init: function()
	{
		var entity = this;
		this.requires("2D");
		return this;
	},

	Appear: function(world, x, y)
	{
		if (!this.has("Sprite"))
			throw new Error("Must have Sprite for body!");

		this._world = world;
		this._tileX = x;
		this._tileY = y;


		if (this.IsStatic)
			this._initStaticBody();
		else
			this._initDynamicBody();

		this._updateSpritePos(true);
		this.trigger("Change");
		this.trigger("Appeared");
	},

	_initStaticBody : function()
	{
		this._world.AddStaticEntity(this);
	},

	_initDynamicBody : function()
	{
		this._world.AddDynamicEntities(this);
		this.bind("EnterFrame", this._update);
	},

	_update : function()
	{
		if (this._moveTo != null)
		{
			var center = this.GetCenter();
			var delta = {};
			delta.x = this._moveTo.x - center.x;
			delta.y = this._moveTo.y - center.y;
			var dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
			if (dist <= this.MovementSpeed)
			{
				this.SetCenter(this._moveTo.x, this._moveTo.y);
				this.StopMoving();
				this.trigger("MoveFinished");
			}
			else
			{
				var x = center.x + delta.x / dist * this.MovementSpeed;
				var y = center.y + delta.y / dist * this.MovementSpeed;
				this.SetCenter(x, y);
			}
		}

		if (this._needUpdateSprite)
		{
			if (this._updateSpritePos(false))
				this._needUpdateSprite = false;
		}
	},

	_updateSpritePos : function(forceUpdate)
	{
		var pos = this.GetSpritePosAtTile(this._tileX, this._tileY);
		if (forceUpdate ||
			Crafty.DrawManager.onScreen({ _x : this.x, _y : this.y, _w : this.w, _h : this.h }) ||
			Crafty.DrawManager.onScreen({ _x : pos.x, _y : pos.y, _w : this.w, _h : this.h }))
		{
			this.x = pos.x;
			this.y = pos.y;
			this.z = pos.z;
			return true;
		}
		return false;
	},

	GetSpritePosAtTile : function(tileX, tileY)
	{
		var x = tileX * this._world.TileSize + (this.TileWidth * this._world.TileSize - this.w) / 2.0;
		var y = tileY * this._world.TileSize + this.TileHeight * this._world.TileSize - this.h;
		var z = Math.round(tileY + this.TileHeight + 1); // add 1 padding with other things (like map, player), could be const
		return { x : x, y : y, z : z};
	},

	GetBounds : function()
	{
		var bounds = [];
		var r = this._tileX + this.TileWidth;
		var b = this._tileY + this.TileHeight;
		for (var x = this._tileX; x < r; x++)
		{
			for (var y = this._tileY; y < b; y++)
				bounds.push({x : x, y : y});
		}

		return bounds;
	},

	SetCenter : function(x, y)
	{
		this._tileX = x - (this.TileWidth - 1) / 2.0;
		this._tileY = y - (this.TileHeight - 1) / 2.0;
		this._needUpdateSprite = true;
	},

	GetCenter : function()
	{
		var centerX = this._tileX + (this.TileWidth - 1) / 2;
		var centerY = this._tileY + (this.TileHeight - 1) / 2;
		return { x : centerX, y : centerY }
	},

	GetCenterReal : function()
	{
		var center = this.GetCenter();
		var x = (center.x + 0.5) * this._world.TileSize;
		var y = (center.y + 0.5) * this._world.TileSize;
		return { x : x, y : y };
	},

	GetCenterRounded : function()
	{
		var center = this.GetCenter();
		center.x = Math.floor(center.x + 0.5);
		center.y = Math.floor(center.y + 0.5);
		return center;
	},

	IsWithinBoxRange : function(center, size)
	{
		var myCenter = this.GetCenter();
		return Math.abs(myCenter.x - center.x) <= size && Math.abs(myCenter.y - center.y) <= size;
	},

	MoveTo : function(x, y)
	{
		this._moveTo = { x : x, y : y };
		var center = this.GetCenterRounded();
		var dirX = Math.min(Math.round(x - center.x), 1);
		var dirY = Math.min(Math.round(y - center.y), 1);
		this.trigger("NewDirection", { x : dirX, y : dirY });
	},

	StopMoving : function()
	{
		this._moveTo = null;
		this.trigger("NewDirection", { x : 0, y : 0 });
	},

	GetEnemies : function()
	{
		var enemyFaction = this._world.GetEnemyFaction(this.Faction);
		return this._world.GetFactionEntities(enemyFaction);
	}
});