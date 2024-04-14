#include <QApplication>
#include <QWebView>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    QWebView view;
    view.load(QUrl("http://www.google.com"));
    view.show();

    return app.exec();
}