import * as RMath from "./math.js";

// projectiles
export let ProjectileState = {
    
    projectileCount : 0,
    projectileOwnerIdx : new Int32Array(1E3),           // hl, projectile owner index (>:0 : hero index; <0 : -enemyIdx-1)
    projectileJointPair : new Int32Array(1E3),          // il, packed attach joint pair (high:jointA, low:jointB). Negative :> free-moving (tile-collision) mode.
    projectilePosition : Array(1E3),                    // jl, projectile position Vec2 — world position when free, local offset when attached.
    projectileVelocity : Array(1E3),                    // kl, projectile velocity Vec2; updated (gravity/homing) and used to advance or transform projectile motion.
    projectileImpactState : new Int32Array(1E3),        // ll, projectile life/state flag (0 : active, 1 : impact/fade-out awaiting deletion).
    
    projectileDrawMode : new Int32Array(1E3),           // ml, projectile draw mode. 0 : simple sprite, 1 : rasterized rotated quad, 2 : draw enemy-sprite branch.
    projectileSpriteTileIndex : new Int32Array(1E3),    // nl, packed projectile sprite-sheet tile info (low bits used for sub-tile, high bits used for tile index -> sheet x/y).
    projectileTintColor : new Int32Array(1E3),          // ol, packed RGBA tint used for projectile color/alpha (alpha scaled by life for fade-out).
    projectileSolidRenderMode : new Int32Array(1E3),    // pl, projectile solid/blend render mode (used as isSolidRender with modes 0/1/2/3 selecting different compositing behavior).
    projectileSpriteWidth : new Int32Array(1E3),        // ql, projectile sprite/render width (pixels) passed to sprite/draw calls.
    projectileSpriteHeight : new Int32Array(1E3),       // rl, projectile sprite/render height (pixels) passed to sprite/draw calls.
    
    projectileShapeMode : new Int32Array(1E3),          // sl, projectile effect shape/mode for hit detection (0 : rectangular area, 1 : line/beam shape; passed as shapeMode to applyEffectToEnemies).
    projectileHitboxWidth : new Int32Array(1E3),        // tl, full hitbox width (pixels) passed to collision/effect routines.
    projectileHitboxHeight : new Int32Array(1E3),       // ul, full hitbox height (pixels) passed to collision/effect routines.
    
    projectileSpawnDelayFrames : new Int32Array(1E3),   // vl, frames to wait before the projectile becomes active (counts down each frame).
    projectileHitCooldownFrames : new Int32Array(1E3),  // wl, short frames of suppressed hit/impact processing after spawn/impact.
    projectileImpactAge : new Int32Array(1E3),          // xl, frames spent in impact/fade-out (incremented while impact-state :: 1).
    projectileImpactLifetime : new Int32Array(1E3),     // yl, frames before an impacted projectile is deleted (impact lifetime).
    projectileAttachJointIndex : new Float32Array(1E3), // zl, attachment/joint index mode (0 : free/gravity; -1 : special; >0 : index into owner joint positions used for seeking/attachment).
    
    projectileAcceleration : new Float32Array(1E3),     // Al, per-projectile acceleration scalar used for gravity or homing (applied as .01 * Al to velocity each update).
    projectileVelocityScale : new Int32Array(1E3),      // Bl, per-projectile velocity scale applied each update (velocity multiplied by .01 * Bl).
    projectileCustomIntA : new Int32Array(1E3),         // Cl, integer per-projectile extra parameter assigned at spawn but not referenced elsewhere (reserved/unused in current code).
    projectileTileCollisionMode : new Int32Array(1E3),  // Dl, per-projectile tile-collision mode controlling how projectiles interact with stage tiles (observed modes: 0 triggers impact, 2/stick-to-tile, 3:bounce, 4:clamp/zero-vel).
    projectileHomingRange : new Int32Array(1E3),        // El, homing/search radius for projectiles; when >0 the projectile searches for targets within El and adjusts velocity toward them.
    projectileCustomIntB : new Int32Array(1E3),         // Fl, integer per-projectile extra parameter assigned at spawn but not observed used elsewhere (reserved/unused in current code).
    projectileMaxTargets : new Int32Array(1E3),         // Gl, per-projectile effect maxTargets passed to applyEffectToEnemies when the projectile hits (limits how many enemies the projectile affects).

    projectileDamageMin : new Int32Array(1E3),          // Hl, projectile effect damage minimum (passed as damageMin to applyEffectToEnemies / damagePartyMemberInArea)
    projectileDamageMax : new Int32Array(1E3),          // Il, projectile effect damage maximum (passed as damageMax to applyEffectToEnemies / damagePartyMemberInArea)
    projectileEffectType : new Int32Array(1E3),         // Jl, projectile effect type (0:phys,1:fire,2:ice,3:light,4:poison - selects damage/effect branch in applyEffectToEnemies)
    projectileEffectDuration : new Int32Array(1E3),     // Kl, projectile effect duration/parameter (frames passed as effectDuration to applyEffectToEnemies)
    projectileApplyMode : new Int32Array(1E3),          // Ll, projectile hit/apply mode flag (controls whether effect call is "check-only" vs applies damage; certain values also alter impact timing)
    projectileImpactSpawnMode : new Int32Array(1E3),    // Ml, projectile impact/spawn mode (selects child-spawn / impact pattern used when the projectile hits)
    projectileSpawnParam : new Int32Array(1E3),         // Nl, projectile spawn parameter (used as angular spread or probability threshold depending on Ml)

    // Per-projectile extra integer parameters forwarded from item/projectile template
    projectileTmplSpeed : new Int32Array(1E3),          // Ol, template itemProjectileSpeedCol forwarded: projectile base speed from item template; carried into spawn and child-spawns.
    projectileTmplElementType : new Int32Array(1E3),    // Pl, template itemElementTypeCol forwarded: item element/type (0:phys,1:fire,2:ice,3:light,4:poison); used by effect/aux logic and forwarded to child spawns.
    projectileTmplElementBonus : new Int32Array(1E3),   // Ql, modified itemIceBonusPercent (adjusted by accessories) forwarded: per-template element bonus percent applied to effect calculations; carried into projectile and child spawns.
    projectileTmplParam1 : new Int32Array(1E3),         // Rl, template itemProjectileParam1Col forwarded: template-specific integer parameter (semantics defined by projectile template); passed to child-spawns.
    projectileTmplAttackMode : new Int32Array(1E3),     // Sl, template itemAttackModeCol forwarded: attack mode flag from item (influences attack/spawn behaviour); carried into projectile and children.
    projectileTmplParam2 : new Int32Array(1E3),         // Tl, template itemProjectileParam2Col forwarded: second template-specific integer parameter; passed through to spawn/impact handlers.
    projectileTmplAux1 : new Int32Array(1E3),           // Ul, template itemProjectileAux1Col forwarded: auxiliary template integer A; forwarded into spawned children.
    projectileTmplAux2 : new Int32Array(1E3),           // Vl, template itemProjectileAux2Col forwarded: auxiliary template integer B; forwarded into spawned children.
    projectileTmplAuxValueA : new Int32Array(1E3),      // Wl, template itemAuxValueACol forwarded: auxiliary value A from item (template-defined use); carried into projectile and child spawns.
    projectileTmplAuxValueB : new Int32Array(1E3),      // Xl, per-projectile template param forwarded to child spawns.
    projectileTmplAuxValueC : new Int32Array(1E3),      // Yl, template itemAuxValueBCol forwarded: auxiliary value B from item; forwarded into spawn/impact calls.
    projectileTmplDisplayStatA : new Int32Array(1E3),   // Zl, template itemDisplayStatACol forwarded: display/stat A from item (often shown in UI or used by template logic); forwarded to children.
    projectileTmplAuxValueD : new Int32Array(1E3),      // $l, template itemAuxValueDCol forwarded: auxiliary value D from item; carried through to spawn/impact handlers.
    projectileTmplFlag : new Int32Array(1E3),           // am, template itemProjectileFlagCol forwarded: bitfield/flag set on the item’s projectile template altering spawn/impact behaviours; forwarded into projectile and child spawns.
    projectileTmplParamTime : new Int32Array(1E3),      // bm, template itemProjectileParamTimeCol forwarded: time/threshold parameter used by some impact/spawn modes; carried from item -> spawn and forwarded into child-spawn calls.
    projectileTmplHitCount : new Int32Array(1E3),       // cm, template itemHitCountCol forwarded: hit/count parameter from item (used as per-template hit-count or chance for spawned children).
    projectileTmplEffectMode : new Int32Array(1E3),     // dm, template itemProjectileEffectModeCol forwarded: per-template effect-mode flag (selects specialised effect/spawn handling); passed from item into projectile and into child spawns.
    projectileTmplStatA : new Int32Array(1E3),          // em, template itemStatACol (modified) forwarded: per-item stat A (modified by hero/accessories) carried into projectile and child spawns for template-specific behaviors.
    projectileTmplExtraStat1 : new Int32Array(1E3),     // fm, template itemExtraStatCol1 forwarded: extra/template stat carried through to projectile and child-spawns (template-defined use).
    
    projectileChildCount : new Int32Array(1E3),         // gm, child‑spawn count (or chance threshold in some impact modes); used as loop bound and probability check.
    projectileChildSpeed : new Int32Array(1E3),         // hm, scalar used to set spawned child projectile velocity/scale (interpreted as speed/magnitude)
};
for (let _i = 0; 1E3 > _i; _i++) ProjectileState.projectilePosition[_i] = new RMath.Vec2;
for (let _i = 0; 1E3 > _i; _i++) ProjectileState.projectileVelocity[_i] = new RMath.Vec2;
