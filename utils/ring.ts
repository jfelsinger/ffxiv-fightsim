//
// Credit: https://playground.babylonjs.com/#VA2P34
import { Vector2, Vector3, VertexData, Mesh, Scene } from '@babylonjs/core';

export type RingOptions = {
    innerRadius: number
    outerRadius: number
    thetaSegments: number
    phiSegments: number
    thetaStart: number
    thetaLength: number
    updatable: boolean
}

export default createRingMesh;
export function createRingMesh(name: string, options: Partial<RingOptions>, scene?: Scene): Mesh {
    const {
        innerRadius = 0.5,
        outerRadius = 1,
        thetaSegments = 8,
        phiSegments = 1,
        thetaStart = 0,
        thetaLength = Math.PI * 2
    } = options
    const mesh = new Mesh(name, scene)

    if (thetaSegments < 3) {
        throw new Error('Invalid theta segements, min 3 are required.')
    }

    if (phiSegments < 1) {
        throw new Error('Invalid phi segements, min 1 are required.')
    }

    //Assign positions, indices and normals to vertexData
    const vertices: number[] = []
    const indices: number[] = []
    const normals: number[] = []
    const uvs: number[] = []

    const radiusStep = (outerRadius - innerRadius) / phiSegments
    const vertex = new Vector3()
    const uv = new Vector2()

    // values are generated from the inside of the ring to the outside
    let radius = innerRadius
    for (let j = 0; j <= phiSegments; j++) {
        for (let i = 0; i <= thetaSegments; i++) {
            const segment = thetaStart + (i / thetaSegments) * thetaLength

            vertex.x = radius * Math.cos(segment)
            vertex.y = radius * Math.sin(segment)
            vertices.push(vertex.x, vertex.y, vertex.z)

            normals.push(0, 0, 1)

            uv.x = (vertex.x / outerRadius + 1) / 2
            uv.y = (vertex.y / outerRadius + 1) / 2
            uvs.push(uv.x, uv.y)
        }

        radius += radiusStep
    }

    for (let j = 0; j < phiSegments; j++) {
        const thetaSegmentLevel = j * (thetaSegments + 1)

        for (let i = 0; i < thetaSegments; i++) {
            const segment = i + thetaSegmentLevel

            const a = segment
            const b = segment + thetaSegments + 1
            const c = segment + thetaSegments + 2
            const d = segment + 1

            // faces
            indices.push(a, b, d)
            indices.push(b, c, d)
        }
    }

    const vertexData = new VertexData()
    VertexData.ComputeNormals(vertices, indices, normals)

    vertexData.positions = vertices
    vertexData.indices = indices
    vertexData.normals = normals
    vertexData.uvs = uvs
    vertexData.applyToMesh(mesh)

    return mesh
}
