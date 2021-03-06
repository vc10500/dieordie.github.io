
var menuToggle = false;
var Navigation = React.createClass({

    getInitialState: function () {
        return {innerHtml: {__html: "<div></div>"}}
    },

    componentDidMount: function () {
        $.ajax({
            url: "views/navigation.tml",
            dataType: "text"
        }).success(function (res) {
            this.setState({innerHtml: {__html: res}});
        }.bind(this));
    },

    render: function () {
        return (
            <div dangerouslySetInnerHTML={this.state.innerHtml}>
            </div>)
    }
});

var PhotoList = React.createClass({
    getInitialState: function () {
        return {data: []}
    },
    componentDidMount: function () {
        $.ajax({
            url: "photos/cebu.json",
            dataType: "json"
        }).success(function (res) {
            this.setState({data: res.Contents});
        }.bind(this));

        PageStore.onReload(function (data) {
            this.setState({data: data});
        }.bind(this));
    },
    render: function () {
        var shard = chunked(this.state.data, 3);
        return (<ul className="container thumb-list">
            {
                shard.map(function (part, idx) {

                    return <PhotoSection photos={part} index={idx}/>
                })
            }
            <Contact/>
        </ul>)
    },
    componentDidUpdate: function () {
        if (!this.inited) {
            $('#photoList').fullpage({
                afterLoad: function (anchorLink, index) {
                    ScrollBarStore.emitScroll(index);
                }
            });
            this.inited =true;
        } else {
            $.fn.fullpage.reBuild();
        }
        $.fn.fullpage.moveTo(1);
        ScrollBarStore.emitScroll(0);
    }
});
var Contact = React.createClass({
    render: function () {
        return (<div className="section container">
            <div className="row">
                <div className="col-lg-8 col-lg-offset-2 text-center">
                    <h2 className="section-heading">Let's Get In Touch!</h2>
                    <hr className="primary"/>
                    <p>Wanna join our next trip? That's great! Give us a call or send us an email and we
                        will get back to you as soon as possible!</p>
                </div>
                <div className="col-lg-4 col-lg-offset-2 text-center">
                    <i className="fa fa-phone fa-3x sr-contact"></i>
                    <p>18516565014</p>
                </div>
                <div className="col-lg-4 text-center">
                    <i className="fa fa-envelope-o fa-3x sr-contact"></i>
                    <p><a href="mailto:suvinseptue@gmail.com">suvinseptue@gmail.com</a></p>
                </div>
            </div>
        </div>)
    }
});
var PhotoSection = React.createClass({
    getInitialState: function () {
        return {data: [], loaded: false}
    }
    ,
    componentDidMount: function () {
        ScrollBarStore.onScroll(function (idx) {
            if ((idx == this.props.index && !this.state.loaded)|| menuToggle) {
                this.setState({data: this.props.photos, loaded: true})
            }
        }.bind(this));
    },
    thumbClick: function (src) {
        $("#scalaPic").attr("src", src);
        $("#scalaModal").modal();
    },
    render: function () {
        return <div className="section container">
            <div className="row">
                {this.state.data.map(function (e) {
                    return <div className="col-xs-4">
                        <a href="#thumbnail" className="thumbnail"
                           onClick={this.thumbClick.bind(this,"http://dieordie.oss-cn-shanghai.aliyuncs.com/"+e.Key)}>
                            <img src={"//dieordie.oss-cn-shanghai.aliyuncs.com/"+e.Key} className="img-responsive"
                                 alt=""/>
                        </a>
                    </div>
                }.bind(this))}
            </div>
        </div>
    }
});
var Footprint = React.createClass({
    footClick: function (dir) {
        $.ajax({
            url: "photos/" + dir,
            dataType: "json"
        }).success(function (res) {
            menuToggle = true;
            PageStore.emitReload(res.Contents);
            menuToggle=false;
        });
    },

    render: function () {
        return <div>
            <i className="fa fa-street-view fa-2x" aria-hidden="true" data-toggle="collapse" aria-expanded="false"
               aria-controls="mapItems"></i>

            <div className="collapse btn-group dropup" id="mapItems">
                <button type="button" class="btn" onClick={this.footClick.bind(this,"cebu.json")}>Cebu</button>
                <button type="button" class="btn" onClick={this.footClick.bind(this,"list_all.json")}>Semporna</button>
            </div>
        </div>
    }

});


function chunked(arr, cap) {
    var res = [];
    var partition = [];

    for (var i in arr) {
        partition.push(arr[i]);
        if ((i + 1) % cap == 0) {
            res.push(partition);
            partition = [];
        }
    }
    if (partition.length > 0) {
        res.push(partition);
    }
    return res;
}

ReactDOM.render(<Navigation />, document.getElementById('pageNav'));
ReactDOM.render(<PhotoList />, document.getElementById('photoList'));
ReactDOM.render(<Footprint />, document.getElementById('footprint'));
