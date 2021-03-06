Player = Creature.extend(
{
	WalkAnimationSpeed : 10,
	ActionAnimations:
	{
		"Shoot" : [ 4, 7, 3 ]
	},

    initialize: function(){
        var playerSpeed = gameContainer.conf.get("PLAYER_SPEED");
        var playerSize = gameContainer.conf.get("PLAYER_SIZE");
		
    	var model = this;
//    	var entity = Crafty.e("2D, Canvas, malePlayer, KeyMoveControls, Mouse, Hero, Animate, Collision")
//    	var entity = Crafty.e("2D, Canvas, malePlayer, KeyMoveControls, Mouse, Hero")
	    var entity = Crafty.e("2D, Canvas, mage, Body, Pawn, Hero, BodyAnimations, Damageable, NavigationHandle, HeroControl, AbilityUser, DebugRendering")
		    .attr({x: 160, y: 144, z: 1, w:playerSize, h:playerSize, Faction : Factions.Monk, MovementSpeed: 0.2, MaxHealth : 300 });

	    for (var slot in SpellBook)
	    {
		    var data = SpellBook[slot];
		    var ability = new data.Type();
		    for (var key in data)
		    {
			    if (key === "Type")
				    continue;
			    else if (key === "Costs")
			        continue;
			    else if (key === "Icon")
			        continue;

			    ability[key] = data[key];
		    }
		    entity.AddAbility(slot, ability);

		    if (data.Costs)
		    {
			    entity.AddSpell(slot, data.Costs, data.Icon);
		    }
	    }

	    // must bind to visual updated but not BodyMoved, otherwise could cause the map redraw twice
	    entity.bind("VisualUpdated", this.followCamera.bind(this));

    	model.set({'entity' : entity });

	    this._setupAnimations();
    },

	followCamera: function()
	{
		//if (this._x === undefined || this._y === undefined)
		//	return;
		var entity = this.getEntity();
		
		var center = entity.GetCenterReal();
		var x0 = center.x - Crafty.viewport.width / 2,
			y0 = center.y - Crafty.viewport.height / 2;
		if (x0 < 0) x0 = 0;
		if (y0 < 0) y0 = 0;

		var tileMap = entity._world.TileMap;
		if (x0 + Crafty.viewport.width > tileMap._width)
			x0 = tileMap._width - Crafty.viewport.width;
		if (y0 + Crafty.viewport.height > tileMap._height)
			y0 = tileMap._height - Crafty.viewport.height;
		Crafty.viewport.scrollTo(-x0, -y0);
	}
});

var SpellBook =
{
	Fireball :
	{
		Type : Ability_Shoot,
		PlayAnim : true,
		Projectile : FireBall
	},

	FlamingHound :
	{
		Costs : { 'light' : 1, 'fire' : 3 },
		Icon : 'flamingHoundIcon',
		Type : Ability_Spell,
		PlayAnim : true,
		Spell :
		{
			Pattern : SpellPatterns.Line,
			Projectile : FlamingHound,
			Total : 8
		}
	},

	LightningStrike :
	{
		Costs : { 'light' : 3, 'dark' : 1 },
		Icon : 'lightningStrikeIcon',
		Type : Ability_Spell,
		PlayAnim : true,
		Spell :
		{
			Pattern : SpellPatterns.Area,
			Projectile : Lightning,
			Radius : 12,
			Total : 25
		}
	}
};
