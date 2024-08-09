import RAPIER from '@dimforge/rapier2d-compat';
import { type GameObjects, type Scene } from 'phaser';
export type TPhysicsObject = {
    rigidBody: RAPIER.RigidBody;
    collider: RAPIER.Collider;
    gameObject: GameObjects.GameObject;
};
type TRapierOptions = {
    /** The type of rigidbody (Dynamic, Fixed, KinematicPositionBased, KinematicVelocityBased) */
    rigidBodyType?: RAPIER.RigidBodyType;
    /**
     * The collider shape, if you pass RAPIER.ColliderDesc.[ball | capsule | cuboid | ...] you need pass the shape size example: RAPIER.ColliderDesc.ball(1.5)
     * - If you don't pass a collider, a cuboid will be created with the dimensions of the game object.
     * - If you pass the type enum RAPIER.ShapeType, the size is created with the dimensions of the object.
     * */
    collider?: RAPIER.ColliderDesc | RAPIER.ShapeType;
    /** If you pass some KinematicPositionBased then you can use Phaser's transformations. NOTE: Phaser transformations are only available for KinematicPositionBased rigid bodies. Scale is not supported please do it manually  */
    phaserTransformations?: boolean;
};
/**
 * Creates a Rapier world and manages its update loop within a Phaser scene.
 * @param {{ x: number, y: number }} gravity - The gravity vector for the Rapier world.
 * @param {Phaser.Scene} scene - The Phaser scene.
 * @returns {Object} An object with methods to interact with the Rapier world.
 */
export declare const createRapierPhysics: (gravity: {
    x: number;
    y: number;
}, scene: Scene) => {
    /**
     * Get the RAPIER world instance
     * @returns world: RAPIER.World
     */
    getWorld: () => RAPIER.World;
    /**
     * Create a rigid body from a Phaser game object, if in options you set phaserTransformations to true, the position and rotation of the game object will be updated by the physics engine (only available for KinematicPositionBased rigid bodies).
     * - If you set a collider, the collider will be created with the specified shape, otherwise a cuboid will be created with the dimensions of the game object.
     * @param body: Phaser.GameObjects.GameObject
     * @param rapierOptions: { world: RAPIER.World, body: Phaser.GameObjects.GameObject, rigidBodyType?: RAPIER.RigidBodyType, colliderDesc?: RAPIER.ColliderDesc, phaserTransformations?: boolean }
     * @returns rigidBodyObject: { rigidBody: RAPIER.RigidBody, collider: RAPIER.Collider, gameObject: Phaser.GameObjects.GameObject }
     */
    addRigidBody: (body: Phaser.GameObjects.GameObject, rapierOptions?: TRapierOptions) => TPhysicsObject;
    /**
     * Enable or disable the debug renderer
     * @param enable: boolean
     */
    debugger: (enable?: boolean) => void;
    /**
     * This method destroys a game object and its rigid body, please use this method to destroy the game object and its rigid body, if you destroy the game object directly, the rigid body will not be destroyed and you will have a memory leak.
     * @param gameObject
     */
    destroy: (gameObject: Phaser.GameObjects.GameObject) => void;
    /**
     * Helps to create a event queue to handle collision events, more info here: https://rapier.rs/docs/user_guides/javascript/advanced_collision_detection_js
     * @returns { eventQueue: RAPIER.EventQueue, free: () => void }
     */
    createEventQueue: () => {
        eventQueue: RAPIER.EventQueue;
        free: () => void;
    };
    /**
     * Free the world and remove the update event
     */
    free: () => void;
};
export { RAPIER };
