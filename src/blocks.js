import React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';

require('codemirror/mode/php/php');
require('codemirror/mode/css/css');
require('codemirror/mode/javascript/javascript');

import './editor.scss';

const { __ } = wp.i18n;
const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editPost;
const { Component, Fragment } = wp.element;
const { compose } = wp.compose;
const { withSelect, dispatch } = wp.data;
const { registerPlugin } = wp.plugins;
const { mediaUpload } = wp.editor;
const {
    PanelBody,
    BaseControl,
    DropZoneProvider,
    DropZone,
    Spinner,
} = wp.components;

class SBB_ArtDirector extends Component {
    constructor( props ) {
        super( props );

        this.state = {
            key: '_sbb_artdirector_css_field',
            value: '',
            isUploading: false,
            errorMessage: '',
        };

        this.codemirror = null;

        this.handleChange = this.handleChange.bind(this);
        this.addFiles = this.addFiles.bind(this);

        wp.apiFetch( { path: `/wp/v2/${ this.props.postType }s/${ this.props.postId }`, method: 'GET' } ).then( ( data ) => {
            this.setState( { value: data.meta._sbb_artdirector_css_field } );
        } );
    }

    static getDerivedStateFromProps( nextProps, state ) {
        if ( nextProps.isPublishing || nextProps.isSaving || nextProps.isAutosaving ) {
            wp.apiRequest(
                {
                    path: `/sortabrilliant/v1/update-meta/${ nextProps.postId }`,
                    method: 'POST',
                    data: state
                }
            );
        }
    }

    handleChange( editor, data, value ) {
        this.setState( { value } );
        // TODO: I don't think this is the proper way to let the editor know a change is made but it works for now.
        dispatch( 'core/editor' ).editPost( 'sortabrilliant-artdirector' );
    }

    addFiles( files ) {
        this.setState( {
            isUploading: true,
            errorMessage: ''
        } );

        mediaUpload( {
            filesList: files,
            onFileChange: ( files ) => {
                const uploadedFiles = files.filter( file => typeof file.id !== "undefined" );
                const fileUrls = uploadedFiles.map( ( file ) => {
                    return file.guid.raw;
                } );

                this.codemirror.getDoc().replaceSelection(
                    fileUrls.toString().replace( ",", "\r\n" )
                );

                if ( files.length === uploadedFiles.length ) {
                    this.setState( { isUploading: false } );
                }
            },
            onError: ( error ) => {
                this.setState( {
                    isUploading: false,
                    errorMessage: error.message,
                } );
            },
        } )
        .then();
    }

    render() {
        return (
            <Fragment>
                <PluginSidebarMoreMenuItem target="sortabrilliant-artdirector-sidebar">
                    { __( 'Art Director' ) }
                </PluginSidebarMoreMenuItem>
                <PluginSidebar
                    name="sortabrilliant-artdirector-sidebar"
                    title={ __( 'Art Director' ) }
                >
                    <PanelBody className="sortabrilliant-artdirector">

                        { this.state.isUploading &&
                            <p>{ __( 'Uploading files...' ) } <Spinner /></p>
                        }

                        { this.state.errorMessage &&
                            <p>{ this.state.errorMessage }</p>
                        }

                        <BaseControl id="sortabrilliant-artdirector-editor"
                            label={ __( 'Add your custom CSS styles' ) }
                            help={ __( 'You can drag and drop files onto the code editor. The URL of the uploaded file will be inserted at your cursor.' ) }>
                            
                            <DropZoneProvider>
                                <div style={ { position:"relative" } } >
                                    <DropZone onFilesDrop={ this.addFiles } />

                                    <CodeMirror
                                        value={this.state.value}
                                        onBeforeChange={this.handleChange}
                                        options={ {
                                            lineNumbers: true,
                                            mode: 'css',
                                            theme: 'material',
                                        } }
                                        editorDidMount={ editor => { this.codemirror = editor } }
                                    />
                                </div>
                            </DropZoneProvider>
                        </BaseControl>
                    </PanelBody>
                </PluginSidebar>
            </Fragment>
        );
    }
}

const applyWithSelect = withSelect( ( select, { forceIsSaving } ) => {
    const {
        getCurrentPostId,
        getCurrentPostType,
        isSavingPost,
        isPublishingPost,
        isAutosavingPost,
    } = select( 'core/editor' );

    return {
        postId: getCurrentPostId(),
        postType: getCurrentPostType(),
        isSaving: forceIsSaving || isSavingPost(),
        isAutosaving: isAutosavingPost(),
        isPublishing: isPublishingPost(),
    };
} );

registerPlugin( 'sortabrilliant-artdirector', {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 64 64"><path d="M27 44h2v2h-2zM47.64 0h-12.7A12.9 12.9 0 0 0 22 12.89v4.47a8.43 8.43 0 0 0 8.42 8.42h7.75v7.75A7.48 7.48 0 0 0 45.69 41h7.51A10.81 10.81 0 0 0 64 30.2V16.36A16.38 16.38 0 0 0 47.64 0zM62 30.2a8.81 8.81 0 0 1-8.8 8.8h-7.51a5.48 5.48 0 0 1-5.47-5.47v-8.75a1 1 0 0 0-1-1h-8.75A6.43 6.43 0 0 1 24 17.36v-4.47A10.9 10.9 0 0 1 34.94 2h12.7A14.38 14.38 0 0 1 62 16.36z"/><path d="M32.56 7.61a4.81 4.81 0 1 0 4.81 4.81 4.81 4.81 0 0 0-4.81-4.81zm0 7.61a2.81 2.81 0 1 1 2.81-2.8 2.81 2.81 0 0 1-2.81 2.8zM44.93 4.76a4.81 4.81 0 1 0 4.8 4.8 4.81 4.81 0 0 0-4.8-4.8zm0 7.61a2.81 2.81 0 1 1 2.8-2.81 2.81 2.81 0 0 1-2.8 2.81zM49.63 18.12a4.81 4.81 0 1 0 4.81-4.8 4.81 4.81 0 0 0-4.81 4.8zm7.61 0a2.81 2.81 0 1 1-2.8-2.8 2.81 2.81 0 0 1 2.8 2.8zM53.49 25.68a4.81 4.81 0 1 0 4.8 4.81 4.81 4.81 0 0 0-4.8-4.81zm0 7.61a2.81 2.81 0 1 1 2.8-2.8 2.81 2.81 0 0 1-2.8 2.8zM4 0C1.25 0 .14 7 .14 8.14a3.83 3.83 0 0 0 1 2.61 2.52 2.52 0 0 0-.73 1.83l1 48.93a2.54 2.54 0 0 0 5.07 0l1-48.92a2.52 2.52 0 0 0-.72-1.84 3.83 3.83 0 0 0 1-2.61C7.86 7 6.75 0 4 0zm1 12a.54.54 0 0 1 .54.56L5.5 15h-3l-.05-2.45A.54.54 0 0 1 3 12zm.45 5v2H2.58v-2zM4 2.06c.75.69 1.86 4.48 1.86 6.09a1.86 1.86 0 0 1-3.71 0C2.14 6.54 3.25 2.74 4 2.06zM4 62a.54.54 0 0 1-.54-.53L2.63 21h2.75l-.83 40.48A.53.53 0 0 1 4 62zM19.28 11.13a3.83 3.83 0 0 0 1.29-2.5c.11-1.16-.31-8.21-3-8.48S13 6.72 12.89 7.88a3.83 3.83 0 0 0 .78 2.7 2.52 2.52 0 0 0-.9 1.75L9 61.12a2.55 2.55 0 0 0 2.28 2.72h.25a2.53 2.53 0 0 0 2.51-2.22L19.83 13a2.52 2.52 0 0 0-.53-1.9zm-1.73 4.09l-3-.29.19-2.45a.53.53 0 0 1 .19-.37.52.52 0 0 1 .4-.12l2 .2a.53.53 0 0 1 .37.2.54.54 0 0 1 .11.41zm-.24 2l-.24 2-2.82-.28.15-2zm-2.43-9.15C15 6.48 16.5 2.81 17.32 2.2c.68.8 1.41 4.64 1.26 6.24a1.87 1.87 0 0 1-2 1.67 1.86 1.86 0 0 1-1.67-2zm-2.81 53.32a.53.53 0 0 1-.58.47.54.54 0 0 1-.48-.58l3.1-40.36 2.74.27zM63 57H27a1 1 0 0 0-.38.08l-6 2.5a1 1 0 0 0 0 1.85l6 2.5A1 1 0 0 0 27 64h36a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1zm-35 2h27v3H28zm29 0h1v3h-1zm-31 .5v2l-2.4-1zM62 62h-2v-3h2zM55 52a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1h-8.61A3.4 3.4 0 0 0 43 48.39V51a1 1 0 0 0 1 1zm-1-2h-5v-3h5zm-9-1.61A1.39 1.39 0 0 1 46.39 47H47v3h-2zM23 50h10a1 1 0 0 0 1-1V35a1 1 0 0 0-1-1H23a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1zm1-2v-8h8v8zm8-12v2h-8v-2z"/></svg>,
    render: compose( applyWithSelect )( SBB_ArtDirector ),
} );
