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
            key: '_sbb_artdirector_field',
            value: '',
            isUploading: false,
            errorMessage: '',
        };

        this.codemirror = null;

        this.handleChange = this.handleChange.bind(this);
        this.addFiles = this.addFiles.bind(this);

        wp.apiFetch( { path: `/wp/v2/${ this.props.postType }s/${ this.props.postId }`, method: 'GET' } ).then( ( data ) => {
            this.setState( { value: data.meta._sbb_artdirector_field } );
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
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="sbb_artdirector_button"><path d="M19 5v14H5V5h14m1.1-2H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM11 7h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6zM7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7z"/></svg>,
    render: compose( applyWithSelect )( SBB_ArtDirector ),
} );
