load('application');

before(loadPost, {
    only: ['show', 'edit', 'update', 'destroy']
    });

action('new', function () {
    this.title = '提出对的问题比给出正确的答案更重要';
    this.query = {q: ''};
    this.post = new Post;
    render();
});

action(function create() {
    Post.create(req.body.Post, function (err, post) {
        //console.log(post);
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: post && post.errors || err});
                } else {
                    send({code: 200, data: post.toObject()});
                }
            });
            format.html(function () {
                //console.log(post);
                if (err) {
                    flash('error', 'Post can not be created');
                    render('new', {
                        post: post,
                        title: 'New post'
                    });
                } else {
                    flash('info', '你今天发布问题也许明天就能授益于人！');
                    redirect(path_to.post(post.id));
                }
            });
        });
    });
});

action(function index() {
    this.title = '精准问答';
	this.query = {q: ''};
    Post.all({order: 'pv'}, function (err, posts) {
        switch (params.format) {
            case "json":
                send({code: 200, data: posts});
                break;
            default:
                render({
                    posts: posts
                });
        }
    });
});

action(function show() {
    this.title = '精准问答';
    this.query = {q: ''};
    this.post.pv = this.post.pv + 1;
    if(this.post.pv == 1000)
        this.post.pv = 2;
    this.post.updateAttributes(this.post, function (err) { });
    switch(params.format) {
        case "json":
            send({code: 200, data: this.post});
            break;
        default:
            render();
    }
});

action(function edit() {
    this.title = '任何人可以提问，任何人可以回答';
	this.query = {q: ''};
    switch(params.format) {
        case "json":
            send(this.post);
            break;
        default:
            render();
    }
});

action(function update() {
    var post = this.post;
    this.title = '精准问答';
	this.query = {q: ''};
	var answer = new Answer;
	//console.log(req.params);
	//console.log(req.body.Post.title);
	answer.question_id = req.params.id;
	answer.question_title = req.body.Post.title;
	answer.content = req.body.Post.content;
	answer.author = req.body.Post.author;
	answer.author_link = req.body.Post.author_link;
	Answer.create(answer, function (err, result) { });
    this.post.updateAttributes(body.Post, function (err) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: post && post.errors || err});
                } else {
                    send({code: 200, data: post});
                }
            });
            format.html(function () {
                if (!err) {
                    flash('info', '持续更新答案是精准恒久不变的目标，但这个目标正是由你实现');
                    redirect(path_to.post(post));
                } else {
                    flash('error', 'Post can not be updated');
                    render('edit');
                }
            });
        });
    });
});

action(function destroy() {
    this.post.destroy(function (error) {
        respondTo(function (format) {
            format.json(function () {
                if (error) {
                    send({code: 500, error: error});
                } else {
                    send({code: 200});
                }
            });
            format.html(function () {
                if (error) {
                    flash('error', 'Can not destroy post');
                } else {
                    flash('info', 'Post successfully removed');
                }
                send("'" + path_to.posts + "'");
            });
        });
    });
});

action('history', function history() {
    this.title = '精准问答-最趋近真实的答案只有一个';
    this.query = {q: ''};
    Answer.all({where: {question_id: params.post_id}, order:'answer_datetime DESC' }, function (err, questions) {
        switch (params.format) {
            case "json":
                send({code: 200, data: posts});
                break;
            default:
                render({
                    questions: questions
                });
        }
    });
});

action('search', function search() {
    this.title = '精准问答';
    this.query = {q: ''};
    Post.all({order:'datetime DESC', where:{title: new RegExp(req.body.q)}}, function (err, posts) {
        switch (params.format) {
            case "json":
                send({code: 200, data: posts});
                break;
            default:
                render({
                    posts: posts
                });
        }
    });
});


action('titles', function titles() {
    this.title = '精准问答';
    this.query = {q: ''};
    Post.all({where:{title: new RegExp(req.query.q)}}, function (err, posts) {
	   var titles = new Array();
	   for(var i=0; i<posts.length; i++){
		titles.push(posts[i].title);
   	   }
           send({code: 200, data: titles});
        }
    );
});

action('tag', function tag() {
    this.title = '精准问答';
    this.query = {q: ''};
    //console.log(req.query.tag);
    Post.all({order: 'datetime DESC', where:{tags: new RegExp(req.query.tag)}}, function (err, posts) {
        //console.log(posts);
        switch (params.format) {
            case "json":
                send({code: 200, data: posts});
                break;
            default:
                render({
                    posts: posts
                });
        }
    });
});

action('about', function tags() {
    this.title = '精准问答--问答版维基百科';
    this.query = {q: ''};
    Post.all(function (err, posts) {
        switch (params.format) {
            case "json":
                send({code: 200, data: posts});
                break;
            default:
                render({
                    posts: posts
                });
        }
    });
});

function loadPost() {
    Post.find(params.id, function (err, post) {
        if (err || !post) {
            if (!err && !post && params.format === 'json') {
                return send({code: 404, error: 'Not found'});
            }
            redirect(path_to.posts);
        } else {
            this.post = post;
            next();
        }
    }.bind(this));
};
