import Router from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Nav, Skeleton, Typography, Space, Button, Tooltip, Spin, Popover } from '@douyinfe/semi-ui';
import { IconChevronLeft, IconArticle } from '@douyinfe/semi-icons';
import { useUser } from 'data/user';
import { useDocumentDetail } from 'data/document';
import { useWindowSize } from 'hooks/use-window-size';
import { Seo } from 'components/seo';
import { Theme } from 'components/theme';
import { DataRender } from 'components/data-render';
import { DocumentShare } from 'components/document/share';
import { DocumentStar } from 'components/document/star';
import { DocumentCollaboration } from 'components/document/collaboration';
import { DocumentStyle } from 'components/document/style';
import { DocumentVersion } from 'components/document/version';
import { User } from 'components/user';
import { Divider } from 'components/divider';
import { useDocumentStyle } from 'hooks/use-document-style';
import { EventEmitter } from 'helpers/event-emitter';
import { Editor } from './editor';
import styles from './index.module.scss';

const { Text } = Typography;

export const em = new EventEmitter();
const TITLE_CHANGE_EVENT = 'TITLE_CHANGE_EVENT';
export const USE_DATA_VERSION = 'USE_DATA_VERSION';

export const changeTitle = (title) => {
  em.emit(TITLE_CHANGE_EVENT, title);
};

const useVersion = (data) => {
  em.emit(USE_DATA_VERSION, data);
};

interface IProps {
  documentId: string;
}

export const DocumentEditor: React.FC<IProps> = ({ documentId }) => {
  if (!documentId) return null;
  const { width: windowWith } = useWindowSize();
  const { width, fontSize } = useDocumentStyle();
  const editorWrapClassNames = useMemo(() => {
    return width === 'standardWidth' ? styles.isStandardWidth : styles.isFullWidth;
  }, [width]);
  const [title, setTitle] = useState('');
  const { user } = useUser();
  const { data: documentAndAuth, loading: docAuthLoading, error: docAuthError } = useDocumentDetail(documentId);
  const { document, authority } = documentAndAuth || {};

  const goback = useCallback(() => {
    Router.push({
      pathname: `/wiki/${document.wikiId}/document/${documentId}`,
    });
  }, [document]);

  const DocumentTitle = (
    <>
      <Tooltip content="返回" position="bottom">
        <Button onClick={goback} icon={<IconChevronLeft />} style={{ marginRight: 16 }} />
      </Tooltip>
      <DataRender
        loading={docAuthLoading}
        error={docAuthError}
        loadingContent={
          <Skeleton active placeholder={<Skeleton.Title style={{ width: 80, marginBottom: 8 }} />} loading={true} />
        }
        normalContent={() => (
          <Text ellipsis={{ showTooltip: true }} style={{ width: ~~(windowWith / 4) }}>
            {title}
          </Text>
        )}
      />
    </>
  );

  useEffect(() => {
    em.on(TITLE_CHANGE_EVENT, setTitle);

    return () => {
      em.destroy();
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <header>
        <Nav
          className={styles.headerOuterWrap}
          mode="horizontal"
          header={DocumentTitle}
          footer={
            <Space>
              {document && authority.readable && (
                <DocumentCollaboration key="collaboration" wikiId={document.wikiId} documentId={documentId} />
              )}
              <DocumentShare key="share" documentId={documentId} />
              <DocumentVersion key="version" documentId={documentId} onSelect={useVersion} />
              <DocumentStar key="star" documentId={documentId} />
              <Popover key="style" zIndex={1061} position="bottomLeft" content={<DocumentStyle />}>
                <Button icon={<IconArticle />} theme="borderless" type="tertiary" />
              </Popover>
              <Theme />
              <Divider />
              <User />
            </Space>
          }
        />
      </header>
      <main className={styles.contentWrap}>
        <DataRender
          loading={docAuthLoading}
          loadingContent={
            <div style={{ margin: 24 }}>
              <Spin></Spin>
            </div>
          }
          error={docAuthError}
          normalContent={() => {
            return (
              <>
                <Seo title={document.title} />
                <Editor
                  key={document.id}
                  user={user}
                  documentId={document.id}
                  authority={authority}
                  className={editorWrapClassNames}
                  style={{ fontSize }}
                />
              </>
            );
          }}
        />
      </main>
    </div>
  );
};
