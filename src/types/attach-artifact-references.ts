import { ArtifactReference } from './artifact-reference';

export class AttachArtifactReferencesRequest {
    readonly items: ArtifactReference[];

    static of(artifactReferences: ArtifactReference[]): AttachArtifactReferencesRequest {
        return { items: [...artifactReferences] };
    }

    static single(name: string, value: string): AttachArtifactReferencesRequest {
        return { items: [{ name, value }] };
    }
}
