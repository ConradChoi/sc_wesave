import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Editor as ToastUIEditor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import $ from 'jquery';
import 'summernote/dist/summernote-lite.min.css';
import 'summernote/dist/summernote-lite.min.js';

// ReactQuill의 findDOMNode 경고 필터링 (개발 환경에서만)
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (args[0]?.includes?.('findDOMNode') || args[0]?.includes?.('findDOMNode')) {
      return; // findDOMNode 경고 무시
    }
    originalWarn.apply(console, args);
  };
}

// CKEditor 5는 동적 import로 처리
let CKEditorComponent: any = null;
let ClassicEditorBuild: any = null;

function Editor() {
  const [activeTab, setActiveTab] = useState<string>('tinymce');
  const [ckEditorLoaded, setCkEditorLoaded] = useState(false);
  const [quillMounted, setQuillMounted] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const summernoteRef = useRef<HTMLDivElement>(null);
  const toastEditorRef = useRef<ToastUIEditor>(null);
  const ckEditorInstanceRef = useRef<any>(null);
  const quillRef = useRef<ReactQuill>(null);

  // CKEditor 5 동적 로드
  useEffect(() => {
    if ((activeTab === 'ckeditor-license' || activeTab === 'ckeditor-free') && !ckEditorLoaded) {
      Promise.all([
        import('@ckeditor/ckeditor5-react'),
        import('@ckeditor/ckeditor5-build-classic')
      ]).then(([reactModule, classicBuild]) => {
        CKEditorComponent = reactModule.CKEditor;
        ClassicEditorBuild = classicBuild.default;
        setCkEditorLoaded(true);
      }).catch((error) => {
        console.error('CKEditor 5 로드 실패:', error);
      });
    }
  }, [activeTab, ckEditorLoaded]);

  // ReactQuill 동적 마운트/언마운트
  useEffect(() => {
    if (activeTab === 'quill' && !quillMounted) {
      setQuillMounted(true);
    } else if (activeTab !== 'quill' && quillMounted) {
      // Quill 탭이 아닐 때 언마운트
      setQuillMounted(false);
    }
  }, [activeTab, quillMounted]);

  // Summernote 초기화 및 cleanup
  useEffect(() => {
    // cleanup 함수: 다른 탭으로 전환 시 Summernote 완전히 제거
    const cleanupSummernote = () => {
      if (summernoteRef.current) {
        const $editor = $(summernoteRef.current);
        try {
          // 모든 Summernote 관련 요소 찾기
          const $noteEditors = $editor.find('.note-editor');
          const $noteToolbar = $editor.find('.note-toolbar');
          const $noteEditable = $editor.find('.note-editable');
          const $noteStatusbar = $editor.find('.note-statusbar');
          
          // 모든 Summernote 인스턴스 제거
          $noteEditors.each(function() {
            try {
              ($(this) as any).summernote('destroy');
            } catch (e) {
              // 무시
            }
          });
          
          // 직접 초기화된 경우
          if ($editor.hasClass('note-editor') || $editor.data('summernote')) {
            try {
              ($editor as any).summernote('destroy');
            } catch (e) {
              // 무시
            }
          }
          
          // DOM 완전히 정리
          $editor.empty();
          $editor.removeClass('note-editor note-air-editor');
          $editor.removeData('summernote');
          $editor.removeAttr('data-summernote');
          
          // Summernote가 생성한 모든 하위 요소 제거
          $noteToolbar.remove();
          $noteEditable.remove();
          $noteStatusbar.remove();
          
          // 전역 Summernote 이벤트 리스너 제거 시도
          $(document).off('summernote');
          $(window).off('summernote');
        } catch (error) {
          console.log('Summernote cleanup 중 에러 (무시):', error);
          // 강제로 DOM 정리
          if ($editor) {
            $editor.empty();
            $editor.removeClass('note-editor note-air-editor');
            $editor.removeData('summernote');
            $editor.removeAttr('data-summernote');
          }
        }
      }
    };
    
    // 다른 탭으로 전환 시 즉시 cleanup
    if (activeTab !== 'summernote') {
      cleanupSummernote();
      return;
    }
    
    // Summernote 탭이 활성화된 경우에만 초기화
    if (activeTab === 'summernote' && summernoteRef.current) {
      const $editor = $(summernoteRef.current);
      // 완전히 비어있고 초기화되지 않은 경우에만 초기화
      if ($editor.children().length === 0 && !$editor.hasClass('note-editor') && !$editor.data('summernote')) {
        // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 초기화
        const timeoutId = setTimeout(() => {
          if (summernoteRef.current && activeTab === 'summernote') {
            const $editorEl = $(summernoteRef.current);
            if ($editorEl.children().length === 0 && !$editorEl.hasClass('note-editor') && !$editorEl.data('summernote')) {
              $editorEl.html('<p>Summernote 에디터입니다. 여기에 내용을 입력하세요.</p>');
              try {
                ($editorEl as any).summernote({
                  height: 400,
                  lang: 'ko-KR',
                  callbacks: {
                    onChange: (contents: string) => {
                      setPreviewContent(contents);
                    }
                  }
                });
                // 초기 내용 설정
                setPreviewContent('<p>Summernote 에디터입니다. 여기에 내용을 입력하세요.</p>');
              } catch (error) {
                console.error('Summernote 초기화 실패:', error);
              }
            }
          }
        }, 100);
        
        return () => {
          clearTimeout(timeoutId);
          // 컴포넌트 언마운트 시 cleanup
          cleanupSummernote();
        };
      }
    }
    
    // cleanup 함수
    return () => {
      cleanupSummernote();
    };
  }, [activeTab]);

  const tabs = [
    { id: 'tinymce', name: 'TinyMCE' },
    { id: 'ckeditor-license', name: 'CKEditor 5 (라이선스)' },
    { id: 'ckeditor-free', name: 'CKEditor 5 (무료버전)' },
    { id: 'toastui', name: 'Toast UI Editor' },
    { id: 'quill', name: 'Quill' },
    { id: 'summernote', name: 'Summernote' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            marginBottom: '16px',
            padding: '8px 16px',
            backgroundColor: '#f5f5f5',
            color: '#333',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'background-color 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e0e0e0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
        >
          ← 뒤로가기
        </Link>
        <h1 style={{
          marginTop: 0,
          marginBottom: '24px',
          fontSize: '28px',
          color: '#333'
        }}>
          WYSIWYG 에디터 모음
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '32px'
        }}>
          다양한 WYSIWYG 에디터를 테스트하고 비교할 수 있는 페이지입니다.
        </p>

        {/* 탭 메뉴 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid #eee'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? '#0077c8' : '#666',
                fontSize: '16px',
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #0077c8' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s'
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* 에디터 영역 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '16px',
            minHeight: '500px'
          }}>
            {activeTab === 'tinymce' && (
              <TinyMCEEditor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY || "p9097tnk96npipnzr0amz38tz8bdsmbhpct6x99200f5gpi3"}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  language: 'ko-KR'
                }}
                onEditorChange={(content: string) => {
                  setPreviewContent(content);
                }}
              />
            )}

            {activeTab === 'ckeditor-license' && (
              <div style={{ minHeight: '500px' }}>
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  backgroundColor: '#d1ecf1',
                  border: '1px solid #bee5eb',
                  borderRadius: '4px',
                  color: '#0c5460',
                  fontSize: '14px'
                }}>
                  ℹ️ CKEditor 5 라이선스 키 만료일: <strong>2025년 12월 17일</strong>
                  <br />
                  <span style={{ fontSize: '12px', color: '#856404' }}>
                    ⚠️ 현재 Trial 라이선스 사용 중 (평가 목적). 프로덕션 사용 시 프로덕션 라이선스가 필요합니다.
                  </span>
                </div>
                {ckEditorLoaded && CKEditorComponent && ClassicEditorBuild ? (
                  <CKEditorComponent
                    editor={ClassicEditorBuild}
                    data="<p>CKEditor 5 (라이선스 버전) 에디터입니다. 여기에 내용을 입력하세요.</p>"
                    config={{
                      licenseKey: import.meta.env.VITE_CKEDITOR_LICENSE_KEY || 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NjU5Mjk1OTksImp0aSI6Ijg1NGM4YTgzLWFlYTYtNGQwNC05OTg2LWY4ZDI0ZTQ4MTE4MCIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6ImU4OTdiZTQ2In0.rSDMKthZe3DSEt-L56DYu2uxTgQoD_PWt-yydW7SpKvxGNIrKL-lJL_tUCfhddY3UWHBlR9NQK-wNeOzTawOGg',
                      toolbar: [
                        'heading', '|',
                        'bold', 'italic', 'link', '|',
                        'bulletedList', 'numberedList', '|',
                        'outdent', 'indent', '|',
                        'blockQuote', 'insertTable', '|',
                        'undo', 'redo'
                      ],
                      language: 'ko'
                    }}
                    onReady={(editor: any) => {
                      console.log('Editor is ready to use!', editor);
                      ckEditorInstanceRef.current = editor;
                      setPreviewContent(editor.getData());
                    }}
                    onChange={(_event: any, editor: any) => {
                      const data = editor.getData();
                      setPreviewContent(data);
                    }}
                  />
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    CKEditor 5를 로딩 중...
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ckeditor-free' && (
              <div style={{ minHeight: '500px' }}>
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '4px',
                  color: '#155724',
                  fontSize: '14px'
                }}>
                  ℹ️ CKEditor 5 무료 버전 (GPL 라이선스)
                </div>
                {ckEditorLoaded && CKEditorComponent && ClassicEditorBuild ? (
                  <CKEditorComponent
                    editor={ClassicEditorBuild}
                    data="<p>CKEditor 5 (무료 버전) 에디터입니다. 여기에 내용을 입력하세요.</p>"
                    config={{
                      licenseKey: 'GPL',
                      toolbar: [
                        'heading', '|',
                        'bold', 'italic', 'link', '|',
                        'bulletedList', 'numberedList', '|',
                        'outdent', 'indent', '|',
                        'blockQuote', 'insertTable', '|',
                        'undo', 'redo'
                      ],
                      language: 'ko'
                    }}
                    onReady={(editor: any) => {
                      console.log('Editor is ready to use!', editor);
                      ckEditorInstanceRef.current = editor;
                      setPreviewContent(editor.getData());
                    }}
                    onChange={(_event: any, editor: any) => {
                      const data = editor.getData();
                      setPreviewContent(data);
                    }}
                  />
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    CKEditor 5를 로딩 중...
                  </div>
                )}
              </div>
            )}

            {activeTab === 'toastui' && (
              <ToastUIEditor
                ref={toastEditorRef}
                initialValue="Toast UI Editor입니다. 여기에 내용을 입력하세요."
                previewStyle="vertical"
                height="500px"
                initialEditType="wysiwyg"
                useCommandShortcut={true}
                language="ko"
                onChange={(_type: string) => {
                  if (toastEditorRef.current) {
                    const html = toastEditorRef.current.getInstance().getHTML();
                    setPreviewContent(html);
                  }
                }}
              />
            )}

            {activeTab === 'quill' && quillMounted && (
              <ReactQuill
                ref={quillRef}
                theme="snow"
                style={{ height: '400px', marginBottom: '50px' }}
                placeholder="Quill 에디터입니다. 여기에 내용을 입력하세요."
                onChange={(_content: string, _delta: any, _source: any, editor: any) => {
                  setPreviewContent(editor.getHTML());
                }}
              />
            )}
            {activeTab === 'quill' && !quillMounted && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                Quill 에디터를 로딩 중...
              </div>
            )}

            {activeTab === 'summernote' ? (
              <div
                ref={summernoteRef}
                style={{ minHeight: '400px' }}
              />
            ) : null}
            
            {activeTab !== 'tinymce' && 
             activeTab !== 'ckeditor-license' &&
             activeTab !== 'ckeditor-free' && 
             activeTab !== 'toastui' && 
             activeTab !== 'quill' && 
             activeTab !== 'summernote' && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                에디터를 선택해주세요.
              </div>
            )}
          </div>

          {/* 미리보기 영역 */}
          {previewContent && (
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '16px',
              backgroundColor: '#fafafa'
            }}>
              <h3 style={{
                marginTop: 0,
                marginBottom: '16px',
                fontSize: '18px',
                color: '#333',
                borderBottom: '2px solid #eee',
                paddingBottom: '8px'
              }}>
                미리보기
              </h3>
              <div
                style={{
                  minHeight: '200px',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0'
                }}
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Editor;
