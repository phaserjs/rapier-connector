import RAPIER from '@dimforge/rapier2d-compat';
import { type GameObjects, type Scene } from 'phaser';

type TAddRigidBodyConfig = {
    world: RAPIER.World,
    body: GameObjects.GameObject,
    rigidBodyType?: RAPIER.RigidBodyType,
    colliderDesc?: RAPIER.ColliderDesc | RAPIER.ShapeType,
    phaserTransformations?: boolean
};

type TRidgiBodyObject = {
    rigidBody: RAPIER.RigidBody;
    collider: RAPIER.Collider;
    gameObject: GameObjects.GameObject;
    phaserTransformations: boolean;
};

export type TPhysicsObject = {
    rigidBody: RAPIER.RigidBody;
    collider: RAPIER.Collider;
    gameObject: GameObjects.GameObject;
};

const addRidgiBody = ({
    world,
    body,
    rigidBodyType,
    colliderDesc,
    phaserTransformations
}: TAddRigidBodyConfig): TRidgiBodyObject => {

    const _body = body as unknown as GameObjects.Image;
    let _colliderDesc: RAPIER.ColliderDesc = RAPIER.ColliderDesc.cuboid(_body.displayWidth / 2, _body.displayHeight / 2);

    if (colliderDesc === undefined) {
        _colliderDesc = RAPIER.ColliderDesc.cuboid(_body.displayWidth / 2, _body.displayHeight / 2);
    } else {
        _colliderDesc = colliderDesc as RAPIER.ColliderDesc;
    }

    if (typeof colliderDesc === 'number') {
        if (colliderDesc === RAPIER.ShapeType.Ball) {
            _colliderDesc = RAPIER.ColliderDesc.ball(_body.displayWidth / 2);
        } else if (colliderDesc === RAPIER.ShapeType.Capsule) {
            _colliderDesc = RAPIER.ColliderDesc.capsule(_body.displayWidth / 4, _body.displayWidth / 2);
        } else if (colliderDesc === RAPIER.ShapeType.Cuboid) {
            _colliderDesc = RAPIER.ColliderDesc.cuboid(_body.displayWidth / 2, _body.displayHeight / 2);
        } else if (colliderDesc === RAPIER.ShapeType.Triangle) {
            const halfWidth = _body.displayWidth / 2;
            const halfHeight = _body.displayHeight / 2;

            // Vertices of the inscribed equilateral triangle
            const vertexA = { x: 0, y: -halfHeight };        // Top midpoint
            const vertexB = { x: -halfWidth, y: halfHeight }; // Bottom-left midpoint
            const vertexC = { x: halfWidth, y: halfHeight };  // Bottom-right midpoint

            _colliderDesc = RAPIER.ColliderDesc.triangle(
                vertexA,
                vertexB,
                vertexC
            );
        } else if (colliderDesc === RAPIER.ShapeType.RoundCuboid) {
            _colliderDesc = RAPIER.ColliderDesc.roundCuboid(_body.displayWidth / 2, _body.displayHeight / 2, 5);
        } else if (colliderDesc === RAPIER.ShapeType.RoundTriangle) {
            const halfWidth = _body.displayWidth / 2;
            const halfHeight = _body.displayHeight / 2;

            const vertexA = { x: 0, y: -halfHeight };
            const vertexB = { x: -halfWidth, y: halfHeight };
            const vertexC = { x: halfWidth, y: halfHeight };

            _colliderDesc = RAPIER.ColliderDesc.roundTriangle(
                vertexA,
                vertexB,
                vertexC,
                5
            );
        } else if (colliderDesc === RAPIER.ShapeType.TriMesh) {
            console.error('TriMesh not implemented, please use a ColliderDesc object');
        } else if (colliderDesc === RAPIER.ShapeType.HalfSpace) {
            console.error('HeightSpace not implemented, please use a ColliderDesc object');
        } else if (colliderDesc === RAPIER.ShapeType.Segment) {
            console.error('Segment not implemented, please use a ColliderDesc object');
        } else if (colliderDesc === RAPIER.ShapeType.ConvexPolygon) {
            console.error('ConvexPolygon not implemented, please use a ColliderDesc object');
        } else if (colliderDesc === RAPIER.ShapeType.RoundConvexPolygon) {
            console.error('RoundConvexPolygon not implemented, please use a ColliderDesc object');
        }
    }

    // Select the rigid body type
    let rigidBodyDesc: RAPIER.RigidBodyDesc;
    if (rigidBodyType !== undefined) {
        switch (rigidBodyType) {
            case RAPIER.RigidBodyType.Dynamic:
                rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
                break;
            case RAPIER.RigidBodyType.Fixed:
                rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
                break;
            case RAPIER.RigidBodyType.KinematicPositionBased:
                rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
                break;
            case RAPIER.RigidBodyType.KinematicVelocityBased:
                rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
                break;
            default:
                rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
                break;
        }
    } else {
        rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
    }
    rigidBodyDesc.setTranslation(_body.x, _body.y);
    rigidBodyDesc.setRotation(_body.rotation);

    rigidBodyDesc.setUserData(_body);

    const rigidBody = world.createRigidBody(rigidBodyDesc);
    const collider = world.createCollider(_colliderDesc, rigidBody);

    // set userData
    return {
        rigidBody,
        collider,
        gameObject: body,
        phaserTransformations: phaserTransformations || false
    }

}

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
export const createRapierPhysics = (gravity: { x: number, y: number }, scene: Scene) => {

    let debugEnabled = false;
    let eventQueue: RAPIER.EventQueue | undefined;

    const world = new RAPIER.World(gravity);

    const debugGraphics = scene.add.graphics();
    debugGraphics.setDepth(10000);
    const bodies: Array<{
        rigidBody: RAPIER.RigidBody,
        collider: RAPIER.Collider,
        gameObject: Phaser.GameObjects.GameObject,
        phaserTransformations: boolean
    }> = [];

    const update = () => {
        if (eventQueue !== undefined) {
            world.step(eventQueue);
            eventQueue.drainCollisionEvents((event) => {
                console.log(event);
            });

        } else {
            world.step();
        }

        bodies.forEach((body) => {
            const rigidBody = body.rigidBody;
            const collider = body.collider;
            const phaserTransformations = body.phaserTransformations;

            const gameObject = body.gameObject as unknown as Phaser.GameObjects.Image;

            if (rigidBody.isFixed()) {
                return;
            }

            if (phaserTransformations) {
                if (rigidBody.isKinematic() && rigidBody.bodyType() === RAPIER.RigidBodyType.KinematicPositionBased) {
                    // Update the position
                    const translation = new RAPIER.Vector2(gameObject.x - gameObject.displayWidth * (gameObject.originX - 0.5), gameObject.y);
                    rigidBody.setNextKinematicTranslation(translation);

                    // Update rotation
                    const rotation = gameObject.rotation;
                    rigidBody.setNextKinematicRotation(rotation);

                    const colliderRotation = gameObject.rotation;
                    collider.setRotation(colliderRotation);
                } else {
                    console.error('Phaser transformations are only available for KinematicPositionBased rigid bodies');
                }
            } else {
                gameObject.x = rigidBody.translation().x;
                gameObject.y = rigidBody.translation().y;
                gameObject.rotation = rigidBody.rotation();
            }
        });

        if (debugEnabled) {
            debugGraphics.clear();

            const debugRender = world.debugRender();
            const vertices = debugRender.vertices;
            const colors = debugRender.colors;

            for (let i = 0; i < vertices.length; i += 4) {
                const x1 = vertices[i];
                const y1 = vertices[i + 1];
                const x2 = vertices[i + 2];
                const y2 = vertices[i + 3];

                const colorIndex = i * 2;
                const r = colors[colorIndex];
                const g = colors[colorIndex + 1];
                const b = colors[colorIndex + 2];
                const a = colors[colorIndex + 3];

                debugGraphics.lineStyle(2, Phaser.Display.Color.GetColor(r * 255, g * 255, b * 255), a);

                debugGraphics.lineBetween(x1, y1, x2, y2);
            }
        }

    };

    scene.events.on('update', update);

    return {
        /**
         * Get the RAPIER world instance
         * @returns world: RAPIER.World
         */
        getWorld: () => world,
        /**
         * Create a rigid body from a Phaser game object, if in options you set phaserTransformations to true, the position and rotation of the game object will be updated by the physics engine (only available for KinematicPositionBased rigid bodies).
         * - If you set a collider, the collider will be created with the specified shape, otherwise a cuboid will be created with the dimensions of the game object.
         * @param body: Phaser.GameObjects.GameObject
         * @param rapierOptions: { world: RAPIER.World, body: Phaser.GameObjects.GameObject, rigidBodyType?: RAPIER.RigidBodyType, colliderDesc?: RAPIER.ColliderDesc, phaserTransformations?: boolean }
         * @returns rigidBodyObject: { rigidBody: RAPIER.RigidBody, collider: RAPIER.Collider, gameObject: Phaser.GameObjects.GameObject }
         */
        addRigidBody: (body: Phaser.GameObjects.GameObject, rapierOptions?: TRapierOptions): TPhysicsObject => {
            const _body = addRidgiBody({
                world,
                body,
                rigidBodyType: rapierOptions?.rigidBodyType,
                colliderDesc: rapierOptions?.collider,
                phaserTransformations: rapierOptions?.phaserTransformations
            });
            bodies.unshift(_body);
            return { collider: _body.collider, rigidBody: _body.rigidBody, gameObject: _body.gameObject };
        },
        /**
         * Enable or disable the debug renderer
         * @param enable: boolean
         */
        debugger: (enable = true) => {
            debugEnabled = enable;
            if (!enable) {
                debugGraphics.clear();
            }
        },

        /**
         * This method destroys a game object and its rigid body, please use this method to destroy the game object and its rigid body, if you destroy the game object directly, the rigid body will not be destroyed and you will have a memory leak.
         * @param gameObject 
         */
        destroy: (gameObject: Phaser.GameObjects.GameObject) => {

            const body = bodies.find((b: { gameObject: Phaser.GameObjects.GameObject }) => b.gameObject === gameObject);
            if (body?.rigidBody !== undefined) {
                world.removeRigidBody(body.rigidBody);
                body.gameObject.destroy();

                // Remove from bodies array
                const index = bodies.indexOf(body);
                if (index > -1) {
                    bodies.splice(index, 1);
                }
            }

        },
        /**
         * Helps to create a event queue to handle collision events, more info here: https://rapier.rs/docs/user_guides/javascript/advanced_collision_detection_js
         * @returns { eventQueue: RAPIER.EventQueue, free: () => void }
         */
        createEventQueue: () => {
            eventQueue = new RAPIER.EventQueue(true);
            return {
                eventQueue, free: () => {
                    if (eventQueue !== undefined) {
                        eventQueue.free()
                        eventQueue = undefined;
                    }
                }
            };
        },
        /**
         * Free the world and remove the update event
         */
        free: () => {
            world.free();
            scene.events.removeListener('update', update);
        }

    }

}

export {
    RAPIER
}