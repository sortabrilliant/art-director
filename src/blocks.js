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
                            label={ __( 'Add page specific CSS to turn your content from blah into ahhh.' ) }
                            help={ __( 'Upload a file by dropping it on the code editor. The file url will be inserted wherever your cursor is.' ) }>
                            
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
    icon: <svg class="sbb_artdirector_button" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M7.977 10.597c-.19 3.057 1.9 4.6 3.988 4.6 2.075 0 4.164-1.543 3.988-4.6-3.111 2.052-4.967 1.95-7.976 0zm-5.668 8.908c.131-.64.57-3.61.57-6.23 0-.451-.074-1.179-.22-1.645H.731c-.088.393-.131.976-.131 1.645 0 2.256.438 5.56.57 6.216.072.334.306.509.554.509.263 0 .512-.175.585-.495zm1.621.233h1.461c0-2.576 0-2.562 1.651-3.348l2.148-1.033c.95-.452 2.045-1.005 2.045-2.315v-1.164H9.774c0 .873.146 1.66-.964 2.154l-2.206.99c-2.498 1.12-2.674 1.543-2.674 4.716zm-3.214-9.2H2.66c.453-.523.643-.946.643-1.368 0-1.6-1.33-1.805-1.33-2.824 0-.218.045-.45.19-.698C.805 6.39.03 7.729.002 8.879a2.135 2.135 0 0 0 .715 1.66zm3.214 9.2H20l-1.826-3.639-3.287-1.383-1.096-1.092-1.826 4.746-1.826-4.746-1.066 1.063-3.317 1.412-1.826 3.639zm14.61 0H20c0-3.173-.175-3.595-2.673-4.716l-2.206-.99c-1.11-.495-.965-1.28-.965-2.154h-1.46v1.164c0 1.31 1.095 1.863 2.045 2.315l2.147 1.033c1.651.786 1.651.786 1.651 3.348zm-6.575-8.137c-1.49 0-3.068-1.586-3.068-4.527 0-.64 0-1.514 3.068-1.514s3.068.976 3.068 1.514c0 2.955-1.592 4.527-3.068 4.527zm0 1.5c3.652 0 6.618-2.94 6.618-6.55S15.617 0 11.965 0 5.347 2.94 5.347 6.55c0 3.596 2.995 6.55 6.618 6.55zm2.191-1.369l.366-.364c.365-.364.365-.728 0-1.091 0 0-1.096-1.092-2.557-1.092-1.46 0-2.556 1.092-2.556 1.092-.366.363-.366.727 0 1.091 0 .364.73.364.73 0 .365-.364 1.096-.728 1.826-.728s1.461.364 1.826.728c0 0 0 .364.365.364zM10.52 9.68h0-.95.95z"/></svg>,
    render: compose( applyWithSelect )( SBB_ArtDirector ),
} );
